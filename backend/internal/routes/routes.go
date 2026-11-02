package routes

import (
	"time"

	"azyksowda/internal/config"
	"azyksowda/internal/handlers"
	"azyksowda/internal/middleware"
	"azyksowda/internal/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

func Setup(app *fiber.App, cfg *config.Config, h *handlers.Handler) {
	api := app.Group("/api")

	api.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "app": "azyksowda", "time": time.Now()})
	})
	api.Get("/config", h.SiteConfig)

	// ---- auth ----
	auth := api.Group("/auth")
	authLimiter := limiter.New(limiter.Config{
		Max:        30,
		Expiration: time.Minute,
		LimitReached: func(c *fiber.Ctx) error {
			return utils.Fail(c, fiber.StatusTooManyRequests, "Gaty köp synanyşyk. Biraz garaşyň")
		},
	})
	auth.Post("/register", authLimiter, h.Register)
	auth.Post("/login", authLimiter, h.Login)
	auth.Get("/me", middleware.Protected(cfg), h.Me)
	auth.Put("/profile", middleware.Protected(cfg), h.UpdateProfile)
	auth.Post("/logout", middleware.Protected(cfg), h.Logout)

	// ---- public catalog ----
	api.Get("/categories", h.ListCategories)
	api.Get("/categories/:slug", h.GetCategory)
	api.Get("/products", h.ListProducts)
	api.Get("/products/suggest", h.Suggest)
	api.Get("/products/brands", h.Brands)
	api.Get("/products/:slug", h.GetProduct)

	// ---- customer orders ----
	orders := api.Group("/orders", middleware.Protected(cfg))
	orders.Post("/", h.CreateOrder)
	orders.Get("/", h.MyOrders)
	orders.Get("/:id", h.GetOrder)
	orders.Post("/:id/cancel", h.CancelOrder)

	// ---- admin ----
	admin := api.Group("/admin", middleware.Protected(cfg), middleware.AdminOnly())
	admin.Get("/stats", h.Stats)

	admin.Get("/products", h.AdminListProducts)
	admin.Post("/products", h.AdminCreateProduct)
	admin.Get("/products/:id", h.AdminGetProduct)
	admin.Put("/products/:id", h.AdminUpdateProduct)
	admin.Delete("/products/:id", h.AdminDeleteProduct)

	admin.Get("/categories", h.AdminListCategories)
	admin.Post("/categories", h.AdminCreateCategory)
	admin.Put("/categories/:id", h.AdminUpdateCategory)
	admin.Delete("/categories/:id", h.AdminDeleteCategory)

	admin.Get("/orders", h.AdminListOrders)
	admin.Get("/orders/:id", h.GetOrder)
	admin.Put("/orders/:id/status", h.AdminUpdateOrderStatus)

	admin.Get("/users", h.AdminListUsers)
	admin.Put("/users/:id", h.AdminUpdateUser)

	admin.Get("/logs", h.AdminListLogs)
	admin.Post("/upload", h.AdminUpload)

	// ---- static uploads ----
	app.Static("/uploads", cfg.UploadDir, fiber.Static{
		MaxAge:        3600,
		CacheDuration: 10 * time.Second,
	})

	app.Use(func(c *fiber.Ctx) error {
		return utils.Fail(c, fiber.StatusNotFound, "Sahypa tapylmady")
	})
}
