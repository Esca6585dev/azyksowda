package handlers

import (
	"regexp"
	"strings"

	"azyksowda/internal/config"
	"azyksowda/internal/models"
	"azyksowda/internal/utils"

	"gorm.io/gorm"
)

// Handler bundles the dependencies shared by every HTTP handler.
type Handler struct {
	cfg *config.Config
	db  *gorm.DB
}

func New(cfg *config.Config, db *gorm.DB) *Handler {
	return &Handler{cfg: cfg, db: db}
}

var emailRe = regexp.MustCompile(`^[^@\s]+@[^@\s]+\.[^@\s]+$`)

func validEmail(e string) bool { return emailRe.MatchString(e) }

func normalizeEmail(e string) string { return strings.ToLower(strings.TrimSpace(e)) }

// uniqueSlug produces a slug that does not collide with existing rows of the model.
func (h *Handler) uniqueSlug(model interface{}, name string, excludeID uint) string {
	base := utils.Slugify(name)
	slug := base
	for i := 2; i < 1000; i++ {
		var count int64
		q := h.db.Model(model).Where("slug = ?", slug)
		if excludeID > 0 {
			q = q.Where("id <> ?", excludeID)
		}
		q.Count(&count)
		if count == 0 {
			return slug
		}
		slug = base + "-" + itoa(i)
	}
	return slug
}

func itoa(i int) string {
	if i == 0 {
		return "0"
	}
	var b [20]byte
	pos := len(b)
	for i > 0 {
		pos--
		b[pos] = byte('0' + i%10)
		i /= 10
	}
	return string(b[pos:])
}

// publicUser strips nothing (password already hidden by json tag) but is a
// single place to shape the user payload if needed later.
func publicUser(u *models.User) *models.User { return u }
