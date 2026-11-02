package utils

import (
	"encoding/json"
	"log"

	"azyksowda/internal/database"
	"azyksowda/internal/models"

	"github.com/gofiber/fiber/v2"
)

// LogActivity writes a structured activity record into the database and
// mirrors it to the application log. It never fails the request.
func LogActivity(c *fiber.Ctx, action, entity string, entityID uint, message string, details interface{}) {
	entry := models.ActivityLog{
		Action:   action,
		Entity:   entity,
		EntityID: entityID,
		Level:    "info",
		Message:  message,
		IP:       c.IP(),
	}
	if ua := c.Get("User-Agent"); len(ua) > 250 {
		entry.UserAgent = ua[:250]
	} else {
		entry.UserAgent = ua
	}
	if u, ok := c.Locals("user").(*models.User); ok && u != nil {
		id := u.ID
		entry.UserID = &id
		entry.UserEmail = u.Email
	} else if email, ok := c.Locals("email").(string); ok {
		entry.UserEmail = email
	}
	if details != nil {
		if b, err := json.Marshal(details); err == nil {
			entry.Details = string(b)
		}
	}
	if err := database.DB.Create(&entry).Error; err != nil {
		log.Printf("[ACTIVITY] write failed: %v", err)
	}
	log.Printf("[ACTIVITY] %s %s#%d by %s: %s", action, entity, entityID, entry.UserEmail, message)
}

// LogWarn writes a warning-level record (e.g. failed login attempts).
func LogWarn(c *fiber.Ctx, action, message string, details interface{}) {
	entry := models.ActivityLog{Action: action, Level: "warn", Message: message, IP: c.IP()}
	if ua := c.Get("User-Agent"); len(ua) > 250 {
		entry.UserAgent = ua[:250]
	} else {
		entry.UserAgent = ua
	}
	if email, ok := c.Locals("email").(string); ok {
		entry.UserEmail = email
	}
	if details != nil {
		if b, err := json.Marshal(details); err == nil {
			entry.Details = string(b)
		}
	}
	if err := database.DB.Create(&entry).Error; err != nil {
		log.Printf("[ACTIVITY] write failed: %v", err)
	}
	log.Printf("[ACTIVITY][WARN] %s: %s", action, message)
}
