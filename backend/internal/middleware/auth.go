package middleware

import (
	"strings"

	"azyksowda/internal/config"
	"azyksowda/internal/database"
	"azyksowda/internal/models"
	"azyksowda/internal/utils"

	"github.com/gofiber/fiber/v2"
)

func extractToken(c *fiber.Ctx) string {
	h := c.Get("Authorization")
	if strings.HasPrefix(h, "Bearer ") {
		return strings.TrimSpace(strings.TrimPrefix(h, "Bearer "))
	}
	if t := c.Cookies("az_token"); t != "" {
		return t
	}
	return ""
}

// Optional loads the user when a valid token is present but never blocks.
func Optional(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		if token := extractToken(c); token != "" {
			if claims, err := utils.ParseToken(cfg.JWTSecret, token); err == nil {
				var user models.User
				if err := database.DB.First(&user, claims.UserID).Error; err == nil && user.IsActive {
					c.Locals("user", &user)
				}
			}
		}
		return c.Next()
	}
}

// Protected requires a valid JWT and an active user.
func Protected(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		token := extractToken(c)
		if token == "" {
			return utils.Fail(c, fiber.StatusUnauthorized, "Ulgama girmeli")
		}
		claims, err := utils.ParseToken(cfg.JWTSecret, token)
		if err != nil {
			return utils.Fail(c, fiber.StatusUnauthorized, "Sessiýa möhleti gutardy, täzeden giriň")
		}
		var user models.User
		if err := database.DB.First(&user, claims.UserID).Error; err != nil {
			return utils.Fail(c, fiber.StatusUnauthorized, "Ulanyjy tapylmady")
		}
		if !user.IsActive {
			return utils.Fail(c, fiber.StatusForbidden, "Hasabyňyz bloklanan")
		}
		c.Locals("user", &user)
		return c.Next()
	}
}

// AdminOnly must be chained after Protected.
func AdminOnly() fiber.Handler {
	return func(c *fiber.Ctx) error {
		u, ok := c.Locals("user").(*models.User)
		if !ok || u == nil || !u.IsAdmin() {
			return utils.Fail(c, fiber.StatusForbidden, "Diňe administrator üçin")
		}
		return c.Next()
	}
}

// CurrentUser returns the authenticated user from locals.
func CurrentUser(c *fiber.Ctx) *models.User {
	if u, ok := c.Locals("user").(*models.User); ok {
		return u
	}
	return nil
}
