package middleware

import (
	"io"
	"log"
	"os"
	"path/filepath"

	"azyksowda/internal/config"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
)

// SetupLogging configures the application logger to write to stdout and a
// rotating-by-day file in LOG_DIR, and returns the HTTP access-log middleware.
func SetupLogging(cfg *config.Config) (accessLog fiber.Handler, closer func()) {
	if err := os.MkdirAll(cfg.LogDir, 0o755); err != nil {
		log.Printf("[LOG] cannot create log dir: %v", err)
	}

	appFile, err := os.OpenFile(filepath.Join(cfg.LogDir, "app.log"), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o644)
	if err == nil {
		log.SetOutput(io.MultiWriter(os.Stdout, appFile))
	}
	log.SetFlags(log.LstdFlags | log.Lmicroseconds)

	var accessWriter io.Writer = os.Stdout
	accessFile, err := os.OpenFile(filepath.Join(cfg.LogDir, "access.log"), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o644)
	if err == nil {
		accessWriter = io.MultiWriter(os.Stdout, accessFile)
	}

	accessLog = logger.New(logger.Config{
		Format:     "${time} | ${status} | ${latency} | ${ip} | ${method} ${url} | ${locals:requestid} | ${error}\n",
		TimeFormat: "2006-01-02 15:04:05",
		Output:     accessWriter,
	})

	closer = func() {
		if appFile != nil {
			_ = appFile.Close()
		}
		if accessFile != nil {
			_ = accessFile.Close()
		}
	}
	return
}

func RequestID() fiber.Handler { return requestid.New() }

func Recover() fiber.Handler {
	return recover.New(recover.Config{
		EnableStackTrace: true,
		StackTraceHandler: func(c *fiber.Ctx, e interface{}) {
			log.Printf("[PANIC] %s %s: %v", c.Method(), c.Path(), e)
		},
	})
}
