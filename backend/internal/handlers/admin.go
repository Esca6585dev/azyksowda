package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"azyksowda/internal/middleware"
	"azyksowda/internal/models"
	"azyksowda/internal/utils"

	"github.com/gofiber/fiber/v2"
)

// ---------- Dashboard ----------

type dayStat struct {
	Date    string  `json:"date"`
	Label   string  `json:"label"`
	Orders  int64   `json:"orders"`
	Revenue float64 `json:"revenue"`
}

func (h *Handler) Stats(c *fiber.Ctx) error {
	var (
		users, products, activeProducts, categories, orders, pendingOrders int64
		revenue, todayRevenue                                              float64
		todayOrders                                                        int64
	)
	h.db.Model(&models.User{}).Count(&users)
	h.db.Model(&models.Product{}).Count(&products)
	h.db.Model(&models.Product{}).Where("is_active = ?", true).Count(&activeProducts)
	h.db.Model(&models.Category{}).Count(&categories)
	h.db.Model(&models.Order{}).Count(&orders)
	h.db.Model(&models.Order{}).Where("status = ?", models.OrderPending).Count(&pendingOrders)
	h.db.Model(&models.Order{}).Where("status <> ?", models.OrderCancelled).Select("COALESCE(SUM(total),0)").Scan(&revenue)

	now := time.Now()
	dayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	h.db.Model(&models.Order{}).Where("created_at >= ?", dayStart).Count(&todayOrders)
	h.db.Model(&models.Order{}).Where("created_at >= ? AND status <> ?", dayStart, models.OrderCancelled).Select("COALESCE(SUM(total),0)").Scan(&todayRevenue)

	type statusRow struct {
		Status string `json:"status"`
		Count  int64  `json:"count"`
	}
	var byStatus []statusRow
	h.db.Model(&models.Order{}).Select("status, COUNT(*) as count").Group("status").Scan(&byStatus)
	if byStatus == nil {
		byStatus = []statusRow{}
	}

	days := make([]dayStat, 0, 7)
	for i := 6; i >= 0; i-- {
		d := dayStart.AddDate(0, 0, -i)
		next := d.AddDate(0, 0, 1)
		var cnt int64
		var sum float64
		h.db.Model(&models.Order{}).Where("created_at >= ? AND created_at < ?", d, next).Count(&cnt)
		h.db.Model(&models.Order{}).Where("created_at >= ? AND created_at < ? AND status <> ?", d, next, models.OrderCancelled).Select("COALESCE(SUM(total),0)").Scan(&sum)
		days = append(days, dayStat{Date: d.Format("2006-01-02"), Label: d.Format("02.01"), Orders: cnt, Revenue: utils.Round2(sum)})
	}

	var recentOrders []models.Order
	h.db.Preload("User").Order("created_at DESC").Limit(8).Find(&recentOrders)
	if recentOrders == nil {
		recentOrders = []models.Order{}
	}
	var topProducts []models.Product
	h.db.Preload("Category").Order("sold DESC").Limit(6).Find(&topProducts)
	var lowStock []models.Product
	h.db.Where("stock <= ? AND is_active = ?", 10, true).Order("stock ASC").Limit(8).Find(&lowStock)
	if lowStock == nil {
		lowStock = []models.Product{}
	}
	var recentLogs []models.ActivityLog
	h.db.Order("created_at DESC").Limit(8).Find(&recentLogs)
	if recentLogs == nil {
		recentLogs = []models.ActivityLog{}
	}

	return utils.OK(c, fiber.Map{
		"users":            users,
		"products":         products,
		"active_products":  activeProducts,
		"categories":       categories,
		"orders":           orders,
		"pending_orders":   pendingOrders,
		"revenue":          utils.Round2(revenue),
		"today_orders":     todayOrders,
		"today_revenue":    utils.Round2(todayRevenue),
		"orders_by_status": byStatus,
		"sales_7d":         days,
		"recent_orders":    recentOrders,
		"top_products":     topProducts,
		"low_stock":        lowStock,
		"recent_logs":      recentLogs,
	})
}

// ---------- Products ----------

type productInput struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Brand       string  `json:"brand"`
	Price       float64 `json:"price"`
	OldPrice    float64 `json:"old_price"`
	Unit        string  `json:"unit"`
	Weight      string  `json:"weight"`
	Stock       int     `json:"stock"`
	Image       string  `json:"image"`
	Emoji       string  `json:"emoji"`
	CategoryID  uint    `json:"category_id"`
	IsFeatured  *bool   `json:"is_featured"`
	IsActive    *bool   `json:"is_active"`
}

func (h *Handler) validateProduct(in *productInput) map[string]string {
	errs := map[string]string{}
	in.Name = strings.TrimSpace(in.Name)
	if len(in.Name) < 2 {
		errs["name"] = "Haryt ady azyndan 2 harp bolmaly"
	}
	if in.Price <= 0 {
		errs["price"] = "Baha 0-dan uly bolmaly"
	}
	if in.OldPrice < 0 {
		errs["old_price"] = "Köne baha nädogry"
	}
	if in.Stock < 0 {
		errs["stock"] = "Galyndy nädogry"
	}
	if in.CategoryID == 0 {
		errs["category_id"] = "Kategoriýa saýlaň"
	} else {
		var cnt int64
		h.db.Model(&models.Category{}).Where("id = ?", in.CategoryID).Count(&cnt)
		if cnt == 0 {
			errs["category_id"] = "Kategoriýa tapylmady"
		}
	}
	if in.Unit == "" {
		in.Unit = "sany"
	}
	if in.Emoji == "" {
		in.Emoji = "🛒"
	}
	return errs
}

func (h *Handler) AdminListProducts(c *fiber.Ctx) error {
	page, limit, offset := utils.Pagination(c, 20, 200)
	q := h.db.Model(&models.Product{})
	q = h.productFilters(c, q)
	switch c.Query("status") {
	case "active":
		q = q.Where("is_active = ?", true)
	case "inactive":
		q = q.Where("is_active = ?", false)
	}
	if c.Query("low_stock") == "1" {
		q = q.Where("stock <= ?", 10)
	}
	var total int64
	q.Count(&total)
	var items []models.Product
	applySort(q, c.Query("sort", "newest")).Preload("Category").Limit(limit).Offset(offset).Find(&items)
	if items == nil {
		items = []models.Product{}
	}
	return utils.OKMeta(c, items, utils.NewMeta(page, limit, total))
}

func (h *Handler) AdminGetProduct(c *fiber.Ctx) error {
	id, _ := c.ParamsInt("id")
	var p models.Product
	if err := h.db.Preload("Category").First(&p, id).Error; err != nil {
		return utils.Fail(c, fiber.StatusNotFound, "Haryt tapylmady")
	}
	return utils.OK(c, p)
}

func (h *Handler) AdminCreateProduct(c *fiber.Ctx) error {
	var in productInput
	if err := c.BodyParser(&in); err != nil {
		return utils.Fail(c, fiber.StatusBadRequest, "Nädogry maglumat")
	}
	if errs := h.validateProduct(&in); len(errs) > 0 {
		return utils.FailWithErrors(c, fiber.StatusUnprocessableEntity, "Maglumatlary barlaň", errs)
	}
	p := models.Product{
		Name: in.Name, Slug: h.uniqueSlug(&models.Product{}, in.Name, 0), Description: in.Description,
		Brand: strings.TrimSpace(in.Brand), Price: in.Price, OldPrice: in.OldPrice, Unit: in.Unit, Weight: in.Weight,
		Stock: in.Stock, Image: in.Image, Emoji: in.Emoji, CategoryID: in.CategoryID, IsActive: true,
	}
	if in.IsFeatured != nil {
		p.IsFeatured = *in.IsFeatured
	}
	if in.IsActive != nil {
		p.IsActive = *in.IsActive
	}
	if err := h.db.Create(&p).Error; err != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Haryt döredilmedi")
	}
	utils.LogActivity(c, "product.create", "product", p.ID, "Täze haryt goşuldy: "+p.Name, fiber.Map{"price": p.Price, "stock": p.Stock})
	h.db.Preload("Category").First(&p, p.ID)
	return utils.Created(c, p)
}

func (h *Handler) AdminUpdateProduct(c *fiber.Ctx) error {
	id, _ := c.ParamsInt("id")
	var p models.Product
	if err := h.db.First(&p, id).Error; err != nil {
		return utils.Fail(c, fiber.StatusNotFound, "Haryt tapylmady")
	}
	var in productInput
	if err := c.BodyParser(&in); err != nil {
		return utils.Fail(c, fiber.StatusBadRequest, "Nädogry maglumat")
	}
	if errs := h.validateProduct(&in); len(errs) > 0 {
		return utils.FailWithErrors(c, fiber.StatusUnprocessableEntity, "Maglumatlary barlaň", errs)
	}
	changes := fiber.Map{}
	if p.Price != in.Price {
		changes["price"] = fiber.Map{"from": p.Price, "to": in.Price}
	}
	if p.Stock != in.Stock {
		changes["stock"] = fiber.Map{"from": p.Stock, "to": in.Stock}
	}
	updates := map[string]interface{}{
		"name": in.Name, "description": in.Description, "brand": strings.TrimSpace(in.Brand),
		"price": in.Price, "old_price": in.OldPrice, "unit": in.Unit, "weight": in.Weight,
		"stock": in.Stock, "image": in.Image, "emoji": in.Emoji, "category_id": in.CategoryID,
	}
	if in.IsFeatured != nil {
		updates["is_featured"] = *in.IsFeatured
	}
	if in.IsActive != nil {
		updates["is_active"] = *in.IsActive
	}
	if err := h.db.Model(&p).Updates(updates).Error; err != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Haryt täzelenmedi")
	}
	utils.LogActivity(c, "product.update", "product", p.ID, "Haryt täzelendi: "+in.Name, changes)
	h.db.Preload("Category").First(&p, p.ID)
	return utils.OK(c, p)
}

func (h *Handler) AdminDeleteProduct(c *fiber.Ctx) error {
	id, _ := c.ParamsInt("id")
	var p models.Product
	if err := h.db.First(&p, id).Error; err != nil {
		return utils.Fail(c, fiber.StatusNotFound, "Haryt tapylmady")
	}
	var refs int64
	h.db.Model(&models.OrderItem{}).Where("product_id = ?", p.ID).Count(&refs)
	if refs > 0 {
		h.db.Model(&p).Update("is_active", false)
		utils.LogActivity(c, "product.deactivate", "product", p.ID, "Haryt sargytlarda bar, şonuň üçin ýapyldy: "+p.Name, nil)
		return utils.OK(c, fiber.Map{"deleted": false, "deactivated": true, "message": "Haryt sargytlarda ulanylýar, şonuň üçin satuwdan aýryldy"})
	}
	if err := h.db.Delete(&p).Error; err != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Haryt pozulmady")
	}
	utils.LogActivity(c, "product.delete", "product", p.ID, "Haryt pozuldy: "+p.Name, nil)
	return utils.OK(c, fiber.Map{"deleted": true, "message": "Haryt pozuldy"})
}

// ---------- Categories ----------

type categoryInput struct {
	Name        string `json:"name"`
	Emoji       string `json:"emoji"`
	Image       string `json:"image"`
	Description string `json:"description"`
	Color       string `json:"color"`
	SortOrder   int    `json:"sort_order"`
	IsActive    *bool  `json:"is_active"`
}

func (h *Handler) AdminListCategories(c *fiber.Ctx) error {
	var cats []models.Category
	h.db.Order("sort_order ASC, name ASC").Find(&cats)
	type row struct {
		CategoryID uint
		Cnt        int64
	}
	var rows []row
	h.db.Model(&models.Product{}).Select("category_id, COUNT(*) as cnt").Group("category_id").Scan(&rows)
	counts := map[uint]int64{}
	for _, r := range rows {
		counts[r.CategoryID] = r.Cnt
	}
	for i := range cats {
		cats[i].ProductCount = counts[cats[i].ID]
	}
	if cats == nil {
		cats = []models.Category{}
	}
	return utils.OK(c, cats)
}

func (h *Handler) AdminCreateCategory(c *fiber.Ctx) error {
	var in categoryInput
	if err := c.BodyParser(&in); err != nil {
		return utils.Fail(c, fiber.StatusBadRequest, "Nädogry maglumat")
	}
	in.Name = strings.TrimSpace(in.Name)
	if len(in.Name) < 2 {
		return utils.FailWithErrors(c, fiber.StatusUnprocessableEntity, "Maglumatlary barlaň", map[string]string{"name": "Kategoriýa ady azyndan 2 harp bolmaly"})
	}
	if in.Emoji == "" {
		in.Emoji = "🧺"
	}
	if in.Color == "" {
		in.Color = "#2e9e44"
	}
	cat := models.Category{
		Name: in.Name, Slug: h.uniqueSlug(&models.Category{}, in.Name, 0), Emoji: in.Emoji, Image: in.Image,
		Description: in.Description, Color: in.Color, SortOrder: in.SortOrder, IsActive: true,
	}
	if in.IsActive != nil {
		cat.IsActive = *in.IsActive
	}
	if err := h.db.Create(&cat).Error; err != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Kategoriýa döredilmedi")
	}
	utils.LogActivity(c, "category.create", "category", cat.ID, "Täze kategoriýa: "+cat.Name, nil)
	return utils.Created(c, cat)
}

func (h *Handler) AdminUpdateCategory(c *fiber.Ctx) error {
	id, _ := c.ParamsInt("id")
	var cat models.Category
	if err := h.db.First(&cat, id).Error; err != nil {
		return utils.Fail(c, fiber.StatusNotFound, "Kategoriýa tapylmady")
	}
	var in categoryInput
	if err := c.BodyParser(&in); err != nil {
		return utils.Fail(c, fiber.StatusBadRequest, "Nädogry maglumat")
	}
	in.Name = strings.TrimSpace(in.Name)
	if len(in.Name) < 2 {
		return utils.FailWithErrors(c, fiber.StatusUnprocessableEntity, "Maglumatlary barlaň", map[string]string{"name": "Kategoriýa ady azyndan 2 harp bolmaly"})
	}
	updates := map[string]interface{}{
		"name": in.Name, "emoji": in.Emoji, "image": in.Image, "description": in.Description,
		"color": in.Color, "sort_order": in.SortOrder,
	}
	if in.IsActive != nil {
		updates["is_active"] = *in.IsActive
	}
	if err := h.db.Model(&cat).Updates(updates).Error; err != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Kategoriýa täzelenmedi")
	}
	utils.LogActivity(c, "category.update", "category", cat.ID, "Kategoriýa täzelendi: "+in.Name, nil)
	h.db.First(&cat, cat.ID)
	return utils.OK(c, cat)
}

func (h *Handler) AdminDeleteCategory(c *fiber.Ctx) error {
	id, _ := c.ParamsInt("id")
	var cat models.Category
	if err := h.db.First(&cat, id).Error; err != nil {
		return utils.Fail(c, fiber.StatusNotFound, "Kategoriýa tapylmady")
	}
	var cnt int64
	h.db.Model(&models.Product{}).Where("category_id = ?", cat.ID).Count(&cnt)
	if cnt > 0 {
		return utils.Fail(c, fiber.StatusUnprocessableEntity, fmt.Sprintf("Bu kategoriýada %d haryt bar. Ilki harytlary başga kategoriýa geçiriň", cnt))
	}
	if err := h.db.Delete(&cat).Error; err != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Kategoriýa pozulmady")
	}
	utils.LogActivity(c, "category.delete", "category", cat.ID, "Kategoriýa pozuldy: "+cat.Name, nil)
	return utils.OK(c, fiber.Map{"deleted": true})
}

// ---------- Orders ----------

func (h *Handler) AdminListOrders(c *fiber.Ctx) error {
	page, limit, offset := utils.Pagination(c, 20, 200)
	q := h.db.Model(&models.Order{})
	if s := c.Query("status"); s != "" && models.IsValidOrderStatus(s) {
		q = q.Where("status = ?", s)
	}
	if s := strings.TrimSpace(c.Query("q")); s != "" {
		like := "%" + strings.ToLower(s) + "%"
		q = q.Where("LOWER(number) LIKE ? OR LOWER(name) LIKE ? OR phone LIKE ? OR LOWER(address) LIKE ?", like, like, like, like)
	}
	var total int64
	q.Count(&total)
	var orders []models.Order
	q.Preload("User").Preload("Items").Order("created_at DESC, id DESC").Limit(limit).Offset(offset).Find(&orders)
	if orders == nil {
		orders = []models.Order{}
	}
	return utils.OKMeta(c, orders, utils.NewMeta(page, limit, total))
}

func (h *Handler) AdminUpdateOrderStatus(c *fiber.Ctx) error {
	id, _ := c.ParamsInt("id")
	var in struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&in); err != nil || !models.IsValidOrderStatus(in.Status) {
		return utils.Fail(c, fiber.StatusBadRequest, "Status nädogry")
	}
	var ord models.Order
	if err := h.db.Preload("Items").Preload("User").First(&ord, id).Error; err != nil {
		return utils.Fail(c, fiber.StatusNotFound, "Sargyt tapylmady")
	}
	if ord.Status == models.OrderCancelled && in.Status != models.OrderCancelled {
		return utils.Fail(c, fiber.StatusUnprocessableEntity, "Ýatyrylan sargydy täzeden açyp bolmaýar")
	}
	prev := ord.Status
	if err := h.changeOrderStatus(&ord, in.Status); err != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Status täzelenmedi")
	}
	utils.LogActivity(c, "order.status", "order", ord.ID, fmt.Sprintf("Sargyt %s: %s -> %s", ord.Number, prev, in.Status), fiber.Map{"from": prev, "to": in.Status})
	return utils.OK(c, ord)
}

// ---------- Users ----------

func (h *Handler) AdminListUsers(c *fiber.Ctx) error {
	page, limit, offset := utils.Pagination(c, 20, 200)
	q := h.db.Model(&models.User{})
	if s := strings.TrimSpace(c.Query("q")); s != "" {
		like := "%" + strings.ToLower(s) + "%"
		q = q.Where("LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR phone LIKE ?", like, like, like)
	}
	if r := c.Query("role"); r == models.RoleAdmin || r == models.RoleUser {
		q = q.Where("role = ?", r)
	}
	var total int64
	q.Count(&total)
	var users []models.User
	q.Order("created_at DESC").Limit(limit).Offset(offset).Find(&users)
	if users == nil {
		users = []models.User{}
	}
	ids := make([]uint, 0, len(users))
	for _, u := range users {
		ids = append(ids, u.ID)
	}
	if len(ids) > 0 {
		type row struct {
			UserID uint
			Cnt    int64
		}
		var rows []row
		h.db.Model(&models.Order{}).Select("user_id, COUNT(*) as cnt").Where("user_id IN ?", ids).Group("user_id").Scan(&rows)
		counts := map[uint]int64{}
		for _, r := range rows {
			counts[r.UserID] = r.Cnt
		}
		for i := range users {
			users[i].OrderCount = counts[users[i].ID]
		}
	}
	return utils.OKMeta(c, users, utils.NewMeta(page, limit, total))
}

func (h *Handler) AdminUpdateUser(c *fiber.Ctx) error {
	me := middleware.CurrentUser(c)
	id, _ := c.ParamsInt("id")
	var in struct {
		Role     *string `json:"role"`
		IsActive *bool   `json:"is_active"`
	}
	if err := c.BodyParser(&in); err != nil {
		return utils.Fail(c, fiber.StatusBadRequest, "Nädogry maglumat")
	}
	var user models.User
	if err := h.db.First(&user, id).Error; err != nil {
		return utils.Fail(c, fiber.StatusNotFound, "Ulanyjy tapylmady")
	}
	if user.ID == me.ID {
		return utils.Fail(c, fiber.StatusUnprocessableEntity, "Öz hasabyňyzy üýtgedip bolmaýar")
	}
	updates := map[string]interface{}{}
	if in.Role != nil {
		if *in.Role != models.RoleAdmin && *in.Role != models.RoleUser {
			return utils.Fail(c, fiber.StatusBadRequest, "Rol nädogry")
		}
		updates["role"] = *in.Role
	}
	if in.IsActive != nil {
		updates["is_active"] = *in.IsActive
	}
	if len(updates) == 0 {
		return utils.Fail(c, fiber.StatusBadRequest, "Üýtgetme ýok")
	}
	if err := h.db.Model(&user).Updates(updates).Error; err != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Ulanyjy täzelenmedi")
	}
	utils.LogActivity(c, "user.update", "user", user.ID, "Ulanyjy täzelendi: "+user.Email, updates)
	h.db.First(&user, user.ID)
	return utils.OK(c, user)
}

// ---------- Logs ----------

func (h *Handler) AdminListLogs(c *fiber.Ctx) error {
	page, limit, offset := utils.Pagination(c, 50, 200)
	q := h.db.Model(&models.ActivityLog{})
	if a := c.Query("action"); a != "" {
		if strings.HasSuffix(a, ".*") {
			q = q.Where("action LIKE ?", strings.TrimSuffix(a, "*")+"%")
		} else {
			q = q.Where("action = ?", a)
		}
	}
	if l := c.Query("level"); l != "" {
		q = q.Where("level = ?", l)
	}
	if s := strings.TrimSpace(c.Query("q")); s != "" {
		like := "%" + strings.ToLower(s) + "%"
		q = q.Where("LOWER(user_email) LIKE ? OR LOWER(message) LIKE ? OR ip LIKE ?", like, like, like)
	}
	var total int64
	q.Count(&total)
	var logs []models.ActivityLog
	q.Order("created_at DESC, id DESC").Limit(limit).Offset(offset).Find(&logs)
	if logs == nil {
		logs = []models.ActivityLog{}
	}
	var actions []string
	h.db.Model(&models.ActivityLog{}).Distinct("action").Order("action ASC").Pluck("action", &actions)
	if actions == nil {
		actions = []string{}
	}
	return c.JSON(fiber.Map{"success": true, "data": logs, "meta": utils.NewMeta(page, limit, total), "actions": actions})
}

// ---------- Upload ----------

var allowedExt = map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".gif": true, ".svg": true}

func (h *Handler) AdminUpload(c *fiber.Ctx) error {
	fh, err := c.FormFile("file")
	if err != nil {
		return utils.Fail(c, fiber.StatusBadRequest, "Faýl saýlanmady")
	}
	if fh.Size > 5*1024*1024 {
		return utils.Fail(c, fiber.StatusRequestEntityTooLarge, "Faýl 5 MB-dan uly bolmaly däl")
	}
	ext := strings.ToLower(filepath.Ext(fh.Filename))
	if !allowedExt[ext] {
		return utils.Fail(c, fiber.StatusUnsupportedMediaType, "Diňe jpg, png, webp, gif ýa-da svg kabul edilýär")
	}
	buf := make([]byte, 8)
	_, _ = rand.Read(buf)
	sub := time.Now().Format("2006/01")
	dir := filepath.Join(h.cfg.UploadDir, sub)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Katalog döredilmedi")
	}
	name := hex.EncodeToString(buf) + ext
	if err := c.SaveFile(fh, filepath.Join(dir, name)); err != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Faýl ýazylmady")
	}
	url := "/uploads/" + sub + "/" + name
	utils.LogActivity(c, "upload", "file", 0, "Surat ýüklendi: "+url, fiber.Map{"size": fh.Size, "name": fh.Filename})
	return utils.Created(c, fiber.Map{"url": url})
}
