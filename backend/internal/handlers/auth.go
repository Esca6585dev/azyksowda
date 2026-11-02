package handlers

import (
	"strings"
	"time"

	"azyksowda/internal/middleware"
	"azyksowda/internal/models"
	"azyksowda/internal/utils"

	"github.com/gofiber/fiber/v2"
)

type registerInput struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Phone    string `json:"phone"`
}

type loginInput struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type profileInput struct {
	Name            string `json:"name"`
	Phone           string `json:"phone"`
	Address         string `json:"address"`
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

func (h *Handler) authPayload(c *fiber.Ctx, u *models.User) (fiber.Map, error) {
	token, err := utils.GenerateToken(h.cfg.JWTSecret, u.ID, u.Role, h.cfg.JWTExpireHours)
	if err != nil {
		return nil, err
	}
	return fiber.Map{"token": token, "user": publicUser(u)}, nil
}

// Register creates a new customer account.
func (h *Handler) Register(c *fiber.Ctx) error {
	var in registerInput
	if err := c.BodyParser(&in); err != nil {
		return utils.Fail(c, fiber.StatusBadRequest, "Nädogry maglumat")
	}
	in.Name = strings.TrimSpace(in.Name)
	in.Email = normalizeEmail(in.Email)
	in.Phone = strings.TrimSpace(in.Phone)

	errs := map[string]string{}
	if len(in.Name) < 2 {
		errs["name"] = "Adyňyz azyndan 2 harpdan ybarat bolmaly"
	}
	if !validEmail(in.Email) {
		errs["email"] = "E-poçta salgysy nädogry"
	}
	if len(in.Password) < 6 {
		errs["password"] = "Parol azyndan 6 simwoldan ybarat bolmaly"
	}
	if len(errs) > 0 {
		return utils.FailWithErrors(c, fiber.StatusUnprocessableEntity, "Maglumatlary barlaň", errs)
	}

	var exists int64
	h.db.Model(&models.User{}).Where("email = ?", in.Email).Count(&exists)
	if exists > 0 {
		return utils.FailWithErrors(c, fiber.StatusConflict, "Bu e-poçta eýýäm hasaba alnan", map[string]string{"email": "Bu e-poçta eýýäm hasaba alnan"})
	}

	hash, err := utils.HashPassword(in.Password)
	if err != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Parol işlenmedi")
	}
	now := time.Now()
	user := models.User{
		Name:      in.Name,
		Email:     in.Email,
		Password:  hash,
		Phone:     in.Phone,
		Role:      models.RoleUser,
		IsActive:  true,
		LastLogin: &now,
	}
	if err := h.db.Create(&user).Error; err != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Hasap döredilmedi")
	}

	c.Locals("user", &user)
	utils.LogActivity(c, "auth.register", "user", user.ID, "Täze ulanyjy hasaba alyndy: "+user.Email, nil)

	payload, err := h.authPayload(c, &user)
	if err != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Token döredilmedi")
	}
	return utils.Created(c, payload)
}

// Login authenticates with email + password.
func (h *Handler) Login(c *fiber.Ctx) error {
	var in loginInput
	if err := c.BodyParser(&in); err != nil {
		return utils.Fail(c, fiber.StatusBadRequest, "Nädogry maglumat")
	}
	in.Email = normalizeEmail(in.Email)
	c.Locals("email", in.Email)

	var user models.User
	if err := h.db.Where("email = ?", in.Email).First(&user).Error; err != nil || !utils.CheckPassword(user.Password, in.Password) {
		utils.LogWarn(c, "auth.login_failed", "Nädogry giriş synanyşygy: "+in.Email, nil)
		return utils.Fail(c, fiber.StatusUnauthorized, "E-poçta ýa-da parol nädogry")
	}
	if !user.IsActive {
		utils.LogWarn(c, "auth.login_blocked", "Bloklanan hasaba giriş synanyşygy: "+in.Email, nil)
		return utils.Fail(c, fiber.StatusForbidden, "Hasabyňyz bloklanan. Administrator bilen habarlaşyň")
	}

	now := time.Now()
	h.db.Model(&user).Update("last_login", &now)
	user.LastLogin = &now

	c.Locals("user", &user)
	utils.LogActivity(c, "auth.login", "user", user.ID, "Ulgama girdi: "+user.Email, nil)

	payload, err := h.authPayload(c, &user)
	if err != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Token döredilmedi")
	}
	return utils.OK(c, payload)
}

// Me returns the current user profile.
func (h *Handler) Me(c *fiber.Ctx) error {
	u := middleware.CurrentUser(c)
	h.db.Model(&models.Order{}).Where("user_id = ?", u.ID).Count(&u.OrderCount)
	return utils.OK(c, publicUser(u))
}

// Logout only records the event; the client discards the token.
func (h *Handler) Logout(c *fiber.Ctx) error {
	u := middleware.CurrentUser(c)
	utils.LogActivity(c, "auth.logout", "user", u.ID, "Ulgamdan çykdy: "+u.Email, nil)
	return utils.OK(c, fiber.Map{"ok": true})
}

// UpdateProfile edits name / phone / address and optionally the password.
func (h *Handler) UpdateProfile(c *fiber.Ctx) error {
	u := middleware.CurrentUser(c)
	var in profileInput
	if err := c.BodyParser(&in); err != nil {
		return utils.Fail(c, fiber.StatusBadRequest, "Nädogry maglumat")
	}
	in.Name = strings.TrimSpace(in.Name)
	if len(in.Name) < 2 {
		return utils.FailWithErrors(c, fiber.StatusUnprocessableEntity, "Maglumatlary barlaň", map[string]string{"name": "Adyňyz azyndan 2 harpdan ybarat bolmaly"})
	}
	updates := map[string]interface{}{
		"name":    in.Name,
		"phone":   strings.TrimSpace(in.Phone),
		"address": strings.TrimSpace(in.Address),
	}
	if in.NewPassword != "" {
		if !utils.CheckPassword(u.Password, in.CurrentPassword) {
			return utils.FailWithErrors(c, fiber.StatusUnprocessableEntity, "Häzirki parol nädogry", map[string]string{"current_password": "Häzirki parol nädogry"})
		}
		if len(in.NewPassword) < 6 {
			return utils.FailWithErrors(c, fiber.StatusUnprocessableEntity, "Maglumatlary barlaň", map[string]string{"new_password": "Täze parol azyndan 6 simwol bolmaly"})
		}
		hash, err := utils.HashPassword(in.NewPassword)
		if err != nil {
			return utils.Fail(c, fiber.StatusInternalServerError, "Parol işlenmedi")
		}
		updates["password"] = hash
	}
	if err := h.db.Model(u).Updates(updates).Error; err != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Profil täzelenmedi")
	}
	utils.LogActivity(c, "user.profile_update", "user", u.ID, "Profil täzelendi", fiber.Map{"password_changed": in.NewPassword != ""})
	h.db.First(u, u.ID)
	return utils.OK(c, publicUser(u))
}
