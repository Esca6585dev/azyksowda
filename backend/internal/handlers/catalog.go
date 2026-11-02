package handlers

import (
	"strconv"
	"strings"

	"azyksowda/internal/models"
	"azyksowda/internal/utils"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// ---------- Categories ----------

func (h *Handler) attachCategoryCounts(cats []models.Category) {
	type row struct {
		CategoryID uint
		Cnt        int64
	}
	var rows []row
	h.db.Model(&models.Product{}).
		Select("category_id, COUNT(*) as cnt").
		Where("is_active = ?", true).
		Group("category_id").
		Scan(&rows)
	counts := map[uint]int64{}
	for _, r := range rows {
		counts[r.CategoryID] = r.Cnt
	}
	for i := range cats {
		cats[i].ProductCount = counts[cats[i].ID]
	}
}

func (h *Handler) ListCategories(c *fiber.Ctx) error {
	var cats []models.Category
	if err := h.db.Where("is_active = ?", true).Order("sort_order ASC, name ASC").Find(&cats).Error; err != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Kategoriýalar ýüklenmedi")
	}
	h.attachCategoryCounts(cats)
	return utils.OK(c, cats)
}

func (h *Handler) GetCategory(c *fiber.Ctx) error {
	var cat models.Category
	if err := h.db.Where("slug = ? AND is_active = ?", c.Params("slug"), true).First(&cat).Error; err != nil {
		return utils.Fail(c, fiber.StatusNotFound, "Kategoriýa tapylmady")
	}
	h.db.Model(&models.Product{}).Where("category_id = ? AND is_active = ?", cat.ID, true).Count(&cat.ProductCount)
	return utils.OK(c, cat)
}

// ---------- Products ----------

func applySort(q *gorm.DB, sort string) *gorm.DB {
	switch sort {
	case "price_asc":
		return q.Order("price ASC, id DESC")
	case "price_desc":
		return q.Order("price DESC, id DESC")
	case "name":
		return q.Order("name ASC")
	case "newest":
		return q.Order("created_at DESC, id DESC")
	case "discount":
		return q.Order("(old_price - price) DESC, id DESC")
	default: // popular
		return q.Order("sold DESC, id DESC")
	}
}

// productFilters applies the shared query-string filters used by both the
// storefront and the admin listing.
func (h *Handler) productFilters(c *fiber.Ctx, q *gorm.DB) *gorm.DB {
	if cat := strings.TrimSpace(c.Query("category")); cat != "" {
		if id, err := strconv.Atoi(cat); err == nil {
			q = q.Where("category_id = ?", id)
		} else {
			var category models.Category
			if err := h.db.Select("id").Where("slug = ?", cat).First(&category).Error; err == nil {
				q = q.Where("category_id = ?", category.ID)
			} else {
				q = q.Where("1 = 0")
			}
		}
	}
	if s := strings.TrimSpace(c.Query("q")); s != "" {
		// SQL LOWER() only folds ASCII, so "Şeker" would not match "şeker"; the slug is a
		// transliterated ASCII form of the name, which makes the match case-insensitive for
		// Turkmen letters as well.
		like := "%" + strings.ToLower(s) + "%"
		slugLike := "%" + utils.Slugify(s) + "%"
		q = q.Where("LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR slug LIKE ?", like, like, slugLike)
	}
	if c.Query("featured") == "1" || c.Query("featured") == "true" {
		q = q.Where("is_featured = ?", true)
	}
	if c.Query("discount") == "1" || c.Query("discount") == "true" {
		q = q.Where("old_price > price")
	}
	if c.Query("in_stock") == "1" {
		q = q.Where("stock > 0")
	}
	if v, err := strconv.ParseFloat(c.Query("min_price"), 64); err == nil && v > 0 {
		q = q.Where("price >= ?", v)
	}
	if v, err := strconv.ParseFloat(c.Query("max_price"), 64); err == nil && v > 0 {
		q = q.Where("price <= ?", v)
	}
	if b := strings.TrimSpace(c.Query("brand")); b != "" {
		q = q.Where("brand = ?", b)
	}
	return q
}

func (h *Handler) ListProducts(c *fiber.Ctx) error {
	page, limit, offset := utils.Pagination(c, 24, 100)

	q := h.db.Model(&models.Product{}).Where("is_active = ?", true)
	q = h.productFilters(c, q)

	var total int64
	if err := q.Count(&total).Error; err != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Harytlar ýüklenmedi")
	}

	var items []models.Product
	if err := applySort(q, c.Query("sort", "popular")).
		Preload("Category").
		Limit(limit).Offset(offset).
		Find(&items).Error; err != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Harytlar ýüklenmedi")
	}
	if items == nil {
		items = []models.Product{}
	}
	return utils.OKMeta(c, items, utils.NewMeta(page, limit, total))
}

func (h *Handler) GetProduct(c *fiber.Ctx) error {
	var p models.Product
	if err := h.db.Preload("Category").Where("slug = ? AND is_active = ?", c.Params("slug"), true).First(&p).Error; err != nil {
		return utils.Fail(c, fiber.StatusNotFound, "Haryt tapylmady")
	}
	var related []models.Product
	h.db.Where("category_id = ? AND id <> ? AND is_active = ?", p.CategoryID, p.ID, true).
		Order("sold DESC").Limit(8).Find(&related)
	if related == nil {
		related = []models.Product{}
	}
	return utils.OK(c, fiber.Map{"product": p, "related": related})
}

// Suggest powers the header search autocomplete.
func (h *Handler) Suggest(c *fiber.Ctx) error {
	s := strings.TrimSpace(c.Query("q"))
	if len(s) < 2 {
		return utils.OK(c, []models.Product{})
	}
	like := "%" + strings.ToLower(s) + "%"
	slugLike := "%" + utils.Slugify(s) + "%"
	var items []models.Product
	h.db.Select("id, name, slug, price, old_price, image, emoji, weight, category_id").
		Where("is_active = ? AND (LOWER(name) LIKE ? OR LOWER(brand) LIKE ? OR slug LIKE ?)", true, like, like, slugLike).
		Order("sold DESC").Limit(8).Find(&items)
	if items == nil {
		items = []models.Product{}
	}
	return utils.OK(c, items)
}

// Brands returns distinct brand names for filters.
func (h *Handler) Brands(c *fiber.Ctx) error {
	var brands []string
	h.db.Model(&models.Product{}).Where("is_active = ? AND brand <> ''", true).
		Distinct("brand").Order("brand ASC").Pluck("brand", &brands)
	if brands == nil {
		brands = []string{}
	}
	return utils.OK(c, brands)
}

// SiteConfig exposes public settings to the storefront.
func (h *Handler) SiteConfig(c *fiber.Ctx) error {
	return utils.OK(c, fiber.Map{
		"name":               "AzykSowda",
		"delivery_fee":       h.cfg.DeliveryFee,
		"free_delivery_from": h.cfg.FreeDeliveryFrom,
		"currency":           "manat",
		"phone":              "+993 12 947635",
		"phone2":             "+993 12 947550",
		"email":              "azyk.harytlar@gmail.com",
		"address":            "Türkmenistan, Aşgabat şäheri, Azady köçesi 12",
		"work_hours":         "Her gün 08:00 - 23:00",
	})
}
