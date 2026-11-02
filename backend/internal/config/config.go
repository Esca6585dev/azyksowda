package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds all runtime configuration loaded from environment variables.
type Config struct {
	Port             string
	AppEnv           string
	JWTSecret        string
	JWTExpireHours   int
	DBDriver         string
	DatabaseURL      string
	UploadDir        string
	LogDir           string
	FrontendURL      string
	DeliveryFee      float64
	FreeDeliveryFrom float64
	Seed             bool
	AdminEmail       string
	AdminPassword    string
}

func Load() *Config {
	_ = godotenv.Load()

	cfg := &Config{
		Port:             getEnv("PORT", "8080"),
		AppEnv:           getEnv("APP_ENV", "development"),
		JWTSecret:        getEnv("JWT_SECRET", "azyksowda-dev-secret-change-me"),
		JWTExpireHours:   getEnvInt("JWT_EXPIRE_HOURS", 168),
		DBDriver:         getEnv("DB_DRIVER", "sqlite"),
		DatabaseURL:      getEnv("DATABASE_URL", "./data/azyksowda.db"),
		UploadDir:        getEnv("UPLOAD_DIR", "./uploads"),
		LogDir:           getEnv("LOG_DIR", "./logs"),
		FrontendURL:      getEnv("FRONTEND_URL", "http://localhost:3000"),
		DeliveryFee:      getEnvFloat("DELIVERY_FEE", 10),
		FreeDeliveryFrom: getEnvFloat("FREE_DELIVERY_FROM", 200),
		Seed:             getEnvBool("SEED", true),
		AdminEmail:       getEnv("ADMIN_EMAIL", "admin@azyksowda.com"),
		AdminPassword:    getEnv("ADMIN_PASSWORD", "admin123"),
	}

	if cfg.AppEnv == "production" && cfg.JWTSecret == "azyksowda-dev-secret-change-me" {
		log.Println("[WARN] JWT_SECRET is still the development default; set it for production")
	}
	return cfg
}

func (c *Config) IsProduction() bool { return c.AppEnv == "production" }

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func getEnvInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return def
}

func getEnvFloat(key string, def float64) float64 {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.ParseFloat(v, 64); err == nil {
			return n
		}
	}
	return def
}

func getEnvBool(key string, def bool) bool {
	if v := os.Getenv(key); v != "" {
		if b, err := strconv.ParseBool(v); err == nil {
			return b
		}
	}
	return def
}
