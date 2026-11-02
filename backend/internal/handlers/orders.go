package handlers

import (
	"fmt"
	"strings"

	"azyksowda/internal/middleware"
	"azyksowda/internal/models"
	"azyksowda/internal/utils"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type orderItemInput struct {
	ProductID uint `json:"product_id"`
	Quantity  int  `json:"quantity"`
}

type orderInput struct {
	Items         []orderItemInput `json:"items"`
	Name          string           `json:"name"`
	Phone         string           `json:"phone"`
	Address       string           `json:"address"`
	Note          string           `json:"note"`
	PaymentMethod string           `json:"payment_method"`
}

// CreateOrder validates the cart server-side, reserves stock and stores the order.
func (h *Handler) CreateOrder(c *fiber.Ctx) error {
	u := middleware.CurrentUser(c)
	var in orderInput
	if err := c.BodyParser(&in); err != nil {
		return utils.Fail(c, fiber.StatusBadRequest, "Nädogry maglumat")
	}
	in.Name = strings.TrimSpace(in.Name)
	in.Phone = strings.TrimSpace(in.Phone)
	in.Address = strings.TrimSpace(in.Address)
	in.Note = strings.TrimSpace(in.Note)
	if in.PaymentMethod == "" {
		in.PaymentMethod = "cash"
	}

	errs := map[string]string{}
	if len(in.Items) == 0 {
		errs["items"] = "Sebet boş"
	}
	if len(in.Items) > 100 {
		errs["items"] = "Bir sargytda iň köp 100 haryt bolup biler"
	}
	if len(in.Name) < 2 {
		errs["name"] = "Adyňyzy giriziň"
	}
	if len(in.Phone) < 6 {
		errs["phone"] = "Telefon belgiňizi giriziň"
	}
	if len(in.Address) < 5 {
		errs["address"] = "Eltip bermek salgysyny giriziň"
	}
	if in.PaymentMethod != "cash" && in.PaymentMethod != "card" {
		errs["payment_method"] = "Töleg usuly nädogry"
	}
	if len(errs) > 0 {
		return utils.FailWithErrors(c, fiber.StatusUnprocessableEntity, "Maglumatlary barlaň", errs)
	}

	// merge duplicate lines
	qty := map[uint]int{}
	order := []uint{}
	for _, it := range in.Items {
		if it.ProductID == 0 || it.Quantity <= 0 {
			continue
		}
		if _, ok := qty[it.ProductID]; !ok {
			order = append(order, it.ProductID)
		}
		qty[it.ProductID] += it.Quantity
	}
	if len(order) == 0 {
		return utils.Fail(c, fiber.StatusUnprocessableEntity, "Sebet boş")
	}

	var products []models.Product
	h.db.Where("id IN ? AND is_active = ?", order, true).Find(&products)
	byID := map[uint]models.Product{}
	for _, p := range products {
		byID[p.ID] = p
	}

	var items []models.OrderItem
	var subtotal float64
	count := 0
	for _, id := range order {
		p, ok := byID[id]
		if !ok {
			return utils.Fail(c, fiber.StatusUnprocessableEntity, fmt.Sprintf("Haryt #%d indi elýeterli däl", id))
		}
		q := qty[id]
		if q > 99 {
			q = 99
		}
		if p.Stock < q {
			return utils.Fail(c, fiber.StatusUnprocessableEntity, fmt.Sprintf("\"%s\" harydyndan ýeterlik mukdar ýok (galan: %d)", p.Name, p.Stock))
		}
		line := utils.Round2(p.Price * float64(q))
		subtotal += line
		count += q
		items = append(items, models.OrderItem{
			ProductID: p.ID, Name: p.Name, Slug: p.Slug, Image: p.Image, Emoji: p.Emoji, Weight: p.Weight,
			Price: p.Price, Quantity: q, Total: line,
		})
	}
	subtotal = utils.Round2(subtotal)
	fee := h.cfg.DeliveryFee
	if subtotal >= h.cfg.FreeDeliveryFrom {
		fee = 0
	}

	ord := models.Order{
		UserID: u.ID, Status: models.OrderPending,
		Subtotal: subtotal, DeliveryFee: fee, Total: utils.Round2(subtotal + fee), ItemCount: count,
		Name: in.Name, Phone: in.Phone, Address: in.Address, Note: in.Note, PaymentMethod: in.PaymentMethod,
		Items: items,
	}

	err := h.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&ord).Error; err != nil {
			return err
		}
		ord.Number = fmt.Sprintf("AZ%06d", ord.ID)
		if err := tx.Model(&ord).Update("number", ord.Number).Error; err != nil {
			return err
		}
		for _, it := range items {
			res := tx.Model(&models.Product{}).
				Where("id = ? AND stock >= ?", it.ProductID, it.Quantity).
				Updates(map[string]interface{}{
					"stock": gorm.Expr("stock - ?", it.Quantity),
					"sold":  gorm.Expr("sold + ?", it.Quantity),
				})
			if res.Error != nil {
				return res.Error
			}
			if res.RowsAffected == 0 {
				return fmt.Errorf("\"%s\" harydyndan ýeterlik mukdar ýok", it.Name)
			}
		}
		return nil
	})
	if err != nil {
		return utils.Fail(c, fiber.StatusUnprocessableEntity, err.Error())
	}

	// persist the contact details on the profile for next time
	if u.Phone == "" || u.Address == "" {
		h.db.Model(u).Updates(map[string]interface{}{"phone": in.Phone, "address": in.Address})
	}

	utils.LogActivity(c, "order.create", "order", ord.ID,
		fmt.Sprintf("Täze sargyt %s: %d haryt, jemi %.2f manat", ord.Number, count, ord.Total),
		fiber.Map{"total": ord.Total, "items": count, "payment": ord.PaymentMethod})

	h.db.Preload("Items").First(&ord, ord.ID)
	return utils.Created(c, ord)
}

func (h *Handler) MyOrders(c *fiber.Ctx) error {
	u := middleware.CurrentUser(c)
	page, limit, offset := utils.Pagination(c, 10, 50)
	q := h.db.Model(&models.Order{}).Where("user_id = ?", u.ID)
	if s := c.Query("status"); s != "" && models.IsValidOrderStatus(s) {
		q = q.Where("status = ?", s)
	}
	var total int64
	q.Count(&total)
	var orders []models.Order
	q.Preload("Items").Order("created_at DESC, id DESC").Limit(limit).Offset(offset).Find(&orders)
	if orders == nil {
		orders = []models.Order{}
	}
	return utils.OKMeta(c, orders, utils.NewMeta(page, limit, total))
}

func (h *Handler) GetOrder(c *fiber.Ctx) error {
	u := middleware.CurrentUser(c)
	id, err := c.ParamsInt("id")
	if err != nil {
		return utils.Fail(c, fiber.StatusBadRequest, "Nädogry ID")
	}
	var ord models.Order
	if err := h.db.Preload("Items").Preload("User").First(&ord, id).Error; err != nil {
		return utils.Fail(c, fiber.StatusNotFound, "Sargyt tapylmady")
	}
	if ord.UserID != u.ID && !u.IsAdmin() {
		return utils.Fail(c, fiber.StatusForbidden, "Bu sargyda girmäge rugsat ýok")
	}
	return utils.OK(c, ord)
}

// CancelOrder lets a customer cancel while the order is still pending.
func (h *Handler) CancelOrder(c *fiber.Ctx) error {
	u := middleware.CurrentUser(c)
	id, err := c.ParamsInt("id")
	if err != nil {
		return utils.Fail(c, fiber.StatusBadRequest, "Nädogry ID")
	}
	var ord models.Order
	if err := h.db.Preload("Items").First(&ord, id).Error; err != nil {
		return utils.Fail(c, fiber.StatusNotFound, "Sargyt tapylmady")
	}
	if ord.UserID != u.ID && !u.IsAdmin() {
		return utils.Fail(c, fiber.StatusForbidden, "Rugsat ýok")
	}
	if ord.Status != models.OrderPending {
		return utils.Fail(c, fiber.StatusUnprocessableEntity, "Diňe garaşylýan sargydy ýatyryp bolýar")
	}
	if err := h.changeOrderStatus(&ord, models.OrderCancelled); err != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Sargyt ýatyrylmady")
	}
	utils.LogActivity(c, "order.cancel", "order", ord.ID, "Sargyt ýatyryldy: "+ord.Number, nil)
	return utils.OK(c, ord)
}

// changeOrderStatus updates status and restores stock when cancelling.
func (h *Handler) changeOrderStatus(ord *models.Order, status string) error {
	return h.db.Transaction(func(tx *gorm.DB) error {
		if status == models.OrderCancelled && ord.Status != models.OrderCancelled {
			for _, it := range ord.Items {
				if err := tx.Model(&models.Product{}).Where("id = ?", it.ProductID).
					Updates(map[string]interface{}{
						"stock": gorm.Expr("stock + ?", it.Quantity),
						"sold":  gorm.Expr("CASE WHEN sold >= ? THEN sold - ? ELSE 0 END", it.Quantity, it.Quantity),
					}).Error; err != nil {
					return err
				}
			}
		}
		ord.Status = status
		return tx.Model(ord).Update("status", status).Error
	})
}
