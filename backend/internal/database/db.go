package database

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"azyksowda/internal/config"
	"azyksowda/internal/models"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Connect opens the database (sqlite by default, postgres when DB_DRIVER=postgres)
// and runs auto-migrations.
func Connect(cfg *config.Config) *gorm.DB {
	var dialector gorm.Dialector

	switch cfg.DBDriver {
	case "postgres", "postgresql":
		dialector = postgres.Open(cfg.DatabaseURL)
	default:
		dir := filepath.Dir(cfg.DatabaseURL)
		if dir != "" && dir != "." {
			if err := os.MkdirAll(dir, 0o755); err != nil {
				log.Fatalf("[DB] cannot create data dir: %v", err)
			}
		}
		// pure-Go sqlite; WAL mode + busy timeout so reads do not block on writes
		dsn := fmt.Sprintf("%s?_pragma=journal_mode(WAL)&_pragma=busy_timeout(5000)&_pragma=foreign_keys(1)", cfg.DatabaseURL)
		dialector = sqlite.Open(dsn)
	}

	db, err := gorm.Open(dialector, &gorm.Config{
		Logger: logger.New(log.New(os.Stdout, "[DB] ", log.LstdFlags), logger.Config{
			SlowThreshold:             300 * time.Millisecond,
			LogLevel:                  logger.Warn,
			IgnoreRecordNotFoundError: true,
			Colorful:                  false,
		}),
	})
	if err != nil {
		log.Fatalf("[DB] connection failed: %v", err)
	}

	if sqlDB, err := db.DB(); err == nil {
		if cfg.DBDriver == "sqlite" {
			sqlDB.SetMaxOpenConns(1)
		} else {
			sqlDB.SetMaxOpenConns(25)
			sqlDB.SetMaxIdleConns(5)
		}
		sqlDB.SetConnMaxLifetime(time.Hour)
	}

	if err := db.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Product{},
		&models.Order{},
		&models.OrderItem{},
		&models.ActivityLog{},
		&models.Setting{},
	); err != nil {
		log.Fatalf("[DB] migration failed: %v", err)
	}

	DB = db
	log.Printf("[DB] connected (%s)", cfg.DBDriver)
	return db
}
