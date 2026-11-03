package main

import (
	"errors"
	"log"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"azyksowda/internal/config"
	"azyksowda/internal/database"
	"azyksowda/internal/handlers"
	"azyksowda/internal/middleware"
	"azyksowda/internal/routes"
	"azyksowda/internal/seed"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
	cfg := config.Load()

	accessLog, closeLogs := middleware.SetupLogging(cfg)
	defer closeLogs()

	db := database.Connect(cfg)
	if cfg.Seed {
		seed.Run(db, cfg)
	}

	app := fiber.New(fiber.Config{
		AppName:               "Azyksowda API",
		BodyLimit:             10 * 1024 * 1024,
		ReadTimeout:           30 * time.Second,
		WriteTimeout:          30 * time.Second,
		DisableStartupMessage: cfg.IsProduction(),
		// Behind nginx every request comes from 127.0.0.1; read the real client IP
		// from the proxy header so rate limits and activity logs are per client.
		ProxyHeader: cfg.ProxyHeader,
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			var fe *fiber.Error
			if errors.As(err, &fe) {
				code = fe.Code
			}
			if code >= 500 {
				log.Printf("[ERROR] %s %s: %v", c.Method(), c.Path(), err)
			}
			msg := err.Error()
			if code == fiber.StatusInternalServerError {
				msg = "Serwerde näsazlyk ýüze çykdy"
			}
			return c.Status(code).JSON(fiber.Map{"success": false, "message": msg})
		},
	})

	origins := []string{"http://localhost:3000", "http://127.0.0.1:3000"}
	if cfg.FrontendURL != "" {
		origins = append(origins, strings.Split(cfg.FrontendURL, ",")...)
	}

	app.Use(middleware.Recover())
	app.Use(middleware.RequestID())
	app.Use(accessLog)
	app.Use(cors.New(cors.Config{
		AllowOrigins: strings.Join(origins, ","),
		AllowMethods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization, X-Requested-With",
		MaxAge:       3600,
	}))
	app.Use(compress.New())

	routes.Setup(app, cfg, handlers.New(cfg, db))

	go func() {
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
		<-quit
		log.Println("[APP] shutting down...")
		_ = app.ShutdownWithTimeout(10 * time.Second)
	}()

	addr := cfg.Host + ":" + cfg.Port
	log.Printf("[APP] Azyksowda API listening on %s (%s)", addr, cfg.AppEnv)
	if err := app.Listen(addr); err != nil {
		log.Fatalf("[APP] server stopped: %v", err)
	}
}
