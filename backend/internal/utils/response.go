package utils

import (
	"math"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type Meta struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
}

func NewMeta(page, limit int, total int64) Meta {
	tp := int(math.Ceil(float64(total) / float64(limit)))
	if tp < 1 {
		tp = 1
	}
	return Meta{Page: page, Limit: limit, Total: total, TotalPages: tp}
}

func OK(c *fiber.Ctx, data interface{}) error {
	return c.JSON(fiber.Map{"success": true, "data": data})
}

func OKMeta(c *fiber.Ctx, data interface{}, meta Meta) error {
	return c.JSON(fiber.Map{"success": true, "data": data, "meta": meta})
}

func Created(c *fiber.Ctx, data interface{}) error {
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"success": true, "data": data})
}

func Fail(c *fiber.Ctx, status int, msg string) error {
	return c.Status(status).JSON(fiber.Map{"success": false, "message": msg})
}

func FailWithErrors(c *fiber.Ctx, status int, msg string, errs map[string]string) error {
	return c.Status(status).JSON(fiber.Map{"success": false, "message": msg, "errors": errs})
}

// Pagination reads page/limit query params with safe bounds.
func Pagination(c *fiber.Ctx, defaultLimit, maxLimit int) (page, limit, offset int) {
	page, _ = strconv.Atoi(c.Query("page", "1"))
	limit, _ = strconv.Atoi(c.Query("limit", strconv.Itoa(defaultLimit)))
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = defaultLimit
	}
	if limit > maxLimit {
		limit = maxLimit
	}
	offset = (page - 1) * limit
	return
}

func Round2(v float64) float64 { return math.Round(v*100) / 100 }
