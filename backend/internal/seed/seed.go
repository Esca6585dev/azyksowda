package seed

import (
	"crypto/sha256"
	"embed"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"azyksowda/internal/config"
	"azyksowda/internal/models"
	"azyksowda/internal/utils"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// data/products.json + data/images/* are produced from real Ashgabat market
// listings (ynamdar.com grocery sections) and the products of the current
// azyksowda.com.tm site. They are embedded so the binary/docker image can seed
// a fresh database without network access.
//
//go:embed data/products.json data/images/*
var dataFS embed.FS

type seedCategory struct {
	Name, Emoji, Color, Description string
}

type seedProduct struct {
	Source   string  `json:"source"`
	Code     string  `json:"code"`
	Cat      int     `json:"cat"`
	Name     string  `json:"name"`
	Brand    string  `json:"brand"`
	Price    float64 `json:"price"`
	OldPrice float64 `json:"old_price"`
	Unit     string  `json:"unit"`
	Weight   string  `json:"weight"`
	IsNew    bool    `json:"is_new"`
	Featured bool    `json:"featured"`
	Image    string  `json:"image"`
}

var categories = []seedCategory{
	{"Miweler", "🍎", "#ef4444", "Täze we süýji miweler, her gün bazardan"},
	{"Gök önümler", "🥕", "#22c55e", "Ýerli daýhan hojalyklaryndan täze gök önümler we gök otlar"},
	{"Süýt önümleri", "🥛", "#3b82f6", "Süýt, gatyk, peýnir, mesge we ýogurtlar"},
	{"Et we ýumurtga", "🍗", "#f97316", "Et, towuk, balyk, kolbasa we ýumurtga"},
	{"Çörek we konditer", "🍞", "#d97706", "Täze çörek, köke, keks we tortlar"},
	{"Içgiler", "🥤", "#06b6d4", "Suw, şireler, gazly we energiýa içgileri"},
	{"Çaý we kofe", "☕", "#92400e", "Dünýä belli markalaryň çaý we kofeleri"},
	{"Süýjüler", "🍫", "#a855f7", "Şokolad, konfet, bal, halwa we ezmeler"},
	{"Çipsi we hoz", "🥜", "#eab308", "Çipsi, çigit, hoz we gury iýmişler"},
	{"Däneli we makaron", "🍝", "#f59e0b", "Un, tüwi, makaron, ýag, şeker we tiz taýýarlanýan naharlar"},
	{"Konserwler", "🥫", "#64748b", "Konserwler, souslar, maýonez we zeýtun"},
	{"Doňdurylan önümler", "🧊", "#38bdf8", "Pelmeni, doňdurma we doňdurylan önümler"},
	{"Arassaçylyk we öý", "🧴", "#14b8a6", "Kir ýuwujy, gap ýuwujy, sabyn we kagyz önümleri"},
	{"Çaga önümleri", "👶", "#ec4899", "Arlyklar, çaga iýmitleri we ideg serişdeleri"},
}

var descTemplates = []string{
	"%s — %s bölüminiň iň köp satylýan harytlarynyň biri. Hili barlanan, täze we ygtybarly. Sargydyňyzy Aşgabat şäheri boýunça şol günüň özünde eltip berýäris.",
	"%s. %s bölüminden saýlanan önüm. Önümiň möhleti we saklanyş şertleri berk gözegçilikde. 200 manatdan ýokary sargytlara eltip bermek mugt.",
	"Ýokary hilli %s. %s kategoriýasyndaky bu haryt yzygiderli täzelenýär. Amatly baha we çalt eltip bermek — AzykSowda kepilligi.",
	"%s — maşgalaňyz üçin amatly saýlaw. %s bölüminden. Sargyt beriň, 1-2 sagadyň içinde öýüňize çenli eltip bereris.",
}

// Run inserts the demo admin, test customers, categories, products, sample
// orders and activity logs. It is idempotent: each block only runs when the
// corresponding table is empty.
func Run(db *gorm.DB, cfg *config.Config) {
	seedUsers(db, cfg)
	seedCatalog(db, cfg)
	seedOrders(db)
}

func seedUsers(db *gorm.DB, cfg *config.Config) {
	var count int64
	db.Model(&models.User{}).Count(&count)
	if count > 0 {
		return
	}
	adminHash, _ := utils.HashPassword(cfg.AdminPassword)
	testHash, _ := utils.HashPassword("test123")
	users := []models.User{
		{Name: "Administrator", Email: cfg.AdminEmail, Password: adminHash, Role: models.RoleAdmin, Phone: "+993 12 947635", Address: "Aşgabat, Azady köçesi 12", IsActive: true},
		{Name: "Merdan Annaýew", Email: "test@azyksowda.com", Password: testHash, Role: models.RoleUser, Phone: "+993 65 123456", Address: "Aşgabat, Parahat 2/1, 14-nji jaý, 25-nji öý", IsActive: true},
		{Name: "Maýsa Orazowa", Email: "maysa@example.com", Password: testHash, Role: models.RoleUser, Phone: "+993 62 334455", Address: "Aşgabat, Görogly köçesi 48, 7-nji öý", IsActive: true},
		{Name: "Döwlet Berdiýew", Email: "dowlet@example.com", Password: testHash, Role: models.RoleUser, Phone: "+993 61 778899", Address: "Aşgabat, Andalyp köçesi 15", IsActive: true},
	}
	for i := range users {
		users[i].CreatedAt = time.Now().AddDate(0, 0, -(30 - i*5))
		db.Create(&users[i])
	}
	db.Create(&models.ActivityLog{Action: "seed.users", Entity: "user", Level: "info", Message: fmt.Sprintf("%d ulanyjy döredildi (admin: %s)", len(users), cfg.AdminEmail), IP: "127.0.0.1"})
	log.Printf("[SEED] %d users created (admin: %s)", len(users), cfg.AdminEmail)
}

func loadProducts() ([]seedProduct, error) {
	b, err := dataFS.ReadFile("data/products.json")
	if err != nil {
		return nil, err
	}
	var list []seedProduct
	if err := json.Unmarshal(b, &list); err != nil {
		return nil, err
	}
	return list, nil
}

// installImage copies an embedded seed image into UPLOAD_DIR/seed and returns
// its public URL, or "" when the image is missing.
func installImage(cfg *config.Config, file string) string {
	if file == "" {
		return ""
	}
	src, err := dataFS.ReadFile("data/images/" + file)
	if err != nil {
		return ""
	}
	dir := filepath.Join(cfg.UploadDir, "seed")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return ""
	}
	dest := filepath.Join(dir, file)
	if _, err := os.Stat(dest); err != nil {
		if err := os.WriteFile(dest, src, 0o644); err != nil {
			return ""
		}
	}
	return "/uploads/seed/" + file
}

const (
	keyCatalogVersion = "seed_catalog_version"
	keyCatalogSynced  = "seed_catalog_synced_at"
)

// catalogVersion fingerprints the embedded catalog so a database seeded by an
// older build picks up a newer one exactly once.
func catalogVersion() string {
	b, _ := dataFS.ReadFile("data/products.json")
	h := sha256.New()
	h.Write(b)
	fmt.Fprint(h, categories)
	return hex.EncodeToString(h.Sum(nil))[:12]
}

func getSetting(db *gorm.DB, key string) string {
	var s models.Setting
	db.Limit(1).Find(&s, "key = ?", key)
	return s.Value
}

func setSetting(db *gorm.DB, key, value string) {
	db.Clauses(clause.OnConflict{UpdateAll: true}).Create(&models.Setting{Key: key, Value: value})
}

// seedCatalog loads the embedded catalog. A fresh database gets it as is. An
// existing one gets it once per catalog version: categories and products are
// matched by slug and updated, missing ones are added, and rows changed after
// the previous sync (admin edits, sales) are left alone. Databases from the
// first, photo-less demo catalog carry no version; their leftover demo
// products are removed, or hidden when an order still points at them.
func seedCatalog(db *gorm.DB, cfg *config.Config) {
	version := catalogVersion()
	var count int64
	db.Model(&models.Category{}).Count(&count)
	prev := getSetting(db, keyCatalogVersion)
	if count > 0 && prev == version {
		return
	}

	list, err := loadProducts()
	if err != nil {
		log.Printf("[SEED] cannot read embedded products: %v", err)
		return
	}

	fresh, legacy := count == 0, count > 0 && prev == ""
	// rows changed after `since` belong to the admin (or to real sales)
	var since time.Time
	var legacyMark models.ActivityLog
	if legacy {
		// unversioned builds logged seed.catalog right after inserting products
		db.Where("action = ?", "seed.catalog").Order("id ASC").Limit(1).Find(&legacyMark)
		if legacyMark.ID != 0 {
			since = legacyMark.CreatedAt.Add(time.Minute)
		}
	} else if !fresh {
		since, _ = time.Parse(time.RFC3339, getSetting(db, keyCatalogSynced))
	}
	touched := func(t time.Time) bool { return !since.IsZero() && t.After(since) }

	var existingCats []models.Category
	db.Find(&existingCats)
	catBySlug := map[string]*models.Category{}
	for i := range existingCats {
		catBySlug[existingCats[i].Slug] = &existingCats[i]
	}
	catIDs := make([]uint, len(categories))
	catKeepImage := make([]bool, len(categories))
	for i, c := range categories {
		slug := utils.Slugify(c.Name)
		if old, ok := catBySlug[slug]; ok {
			catIDs[i] = old.ID
			catKeepImage[i] = old.Image != "" && !strings.HasPrefix(old.Image, "/uploads/seed/")
			if !touched(old.UpdatedAt) {
				db.Model(old).Updates(map[string]any{"name": c.Name, "emoji": c.Emoji, "color": c.Color,
					"description": c.Description, "sort_order": i + 1, "is_active": true})
			} else {
				catKeepImage[i] = true
			}
			continue
		}
		cat := models.Category{
			Name: c.Name, Slug: slug, Emoji: c.Emoji, Color: c.Color,
			Description: c.Description, SortOrder: i + 1, IsActive: true,
		}
		db.Create(&cat)
		catIDs[i] = cat.ID
	}

	var existing []models.Product
	if !fresh {
		db.Find(&existing)
	}
	bySlug := map[string]*models.Product{}
	for i := range existing {
		bySlug[existing[i].Slug] = &existing[i]
	}
	inCatalog := map[uint]bool{}

	usedSlugs := map[string]int{}
	catImage := make([]string, len(categories))
	now := time.Now()
	created, updated, skipped, withImage := 0, 0, 0, 0
	for i, p := range list {
		if p.Cat < 0 || p.Cat >= len(categories) || p.Price <= 0 {
			continue
		}
		slugBase := utils.Slugify(p.Name)
		if len(slugBase) > 120 {
			slugBase = slugBase[:120]
		}
		slug := slugBase
		if n, ok := usedSlugs[slugBase]; ok {
			slug = fmt.Sprintf("%s-%d", slugBase, n+1)
			usedSlugs[slugBase] = n + 1
		} else {
			usedSlugs[slugBase] = 1
		}

		img := installImage(cfg, p.Image)
		if img != "" {
			withImage++
			if catImage[p.Cat] == "" || p.Featured {
				catImage[p.Cat] = img
			}
		}

		stock := 20 + (i*37)%180
		if i%23 == 11 {
			stock = 1 + (i*3)%9 // a few low-stock items for the admin dashboard
		}
		createdAt := now.Add(-time.Duration(i) * 5 * time.Hour)
		if p.IsNew {
			createdAt = now.Add(-time.Duration(i%48) * time.Hour)
		}
		unit := p.Unit
		if unit == "" {
			unit = "sany"
		}
		featured := p.Featured || i%9 == 0
		description := fmt.Sprintf(descTemplates[i%len(descTemplates)], p.Name, categories[p.Cat].Name)

		if old, ok := bySlug[slug]; ok {
			inCatalog[old.ID] = true
			if touched(old.UpdatedAt) {
				skipped++
				continue
			}
			// stock and sold are live counters; keep them
			db.Model(old).Updates(map[string]any{
				"name": p.Name, "description": description, "brand": p.Brand, "price": p.Price,
				"old_price": p.OldPrice, "unit": unit, "weight": p.Weight, "image": img,
				"emoji": categories[p.Cat].Emoji, "category_id": catIDs[p.Cat],
				"is_featured": featured, "is_active": true,
			})
			updated++
			continue
		}

		prod := models.Product{
			Name: p.Name, Slug: slug, Description: description,
			Brand: p.Brand, Price: p.Price, OldPrice: p.OldPrice, Unit: unit, Weight: p.Weight,
			Stock: stock, Sold: (i*53)%400 + 5, Image: img, Emoji: categories[p.Cat].Emoji,
			CategoryID: catIDs[p.Cat], IsFeatured: featured, IsActive: true,
			CreatedAt: createdAt, UpdatedAt: createdAt,
		}
		if err := db.Create(&prod).Error; err != nil {
			log.Printf("[SEED] product %q failed: %v", p.Name, err)
			continue
		}
		created++
	}

	for i, img := range catImage {
		if img != "" && !catKeepImage[i] {
			db.Model(&models.Category{}).Where("id = ?", catIDs[i]).Update("image", img)
		}
	}

	removed, hidden := 0, 0
	if legacyMark.ID != 0 {
		removed, hidden = retireLegacyProducts(db, existing, inCatalog, since)
	}

	setSetting(db, keyCatalogVersion, version)
	setSetting(db, keyCatalogSynced, time.Now().UTC().Format(time.RFC3339))

	if fresh {
		db.Create(&models.ActivityLog{Action: "seed.catalog", Entity: "product", Level: "info",
			Message: fmt.Sprintf("%d kategoriýa we %d haryt döredildi (%d suratly)", len(categories), created, withImage), IP: "127.0.0.1"})
		log.Printf("[SEED] %d categories, %d products (%d with photos) created", len(categories), created, withImage)
		return
	}
	db.Create(&models.ActivityLog{Action: "seed.catalog_sync", Entity: "product", Level: "info",
		Message: fmt.Sprintf("Katalog täzelendi: %d täze, %d täzelendi, %d üýtgedilen galdy, %d köne aýryldy, %d gizlendi",
			created, updated, skipped, removed, hidden), IP: "127.0.0.1"})
	log.Printf("[SEED] catalog %s synced: %d new, %d updated, %d kept (edited), %d old removed, %d hidden",
		version, created, updated, skipped, removed, hidden)
}

// retireLegacyProducts drops the demo products of the first catalog that the
// current one no longer has. Products created or edited after that seed
// (cutoff) belong to the admin and stay; ones still referenced by an order are
// only hidden.
func retireLegacyProducts(db *gorm.DB, existing []models.Product, inCatalog map[uint]bool, cutoff time.Time) (removed, hidden int) {
	for i := range existing {
		p := &existing[i]
		if inCatalog[p.ID] || p.CreatedAt.After(cutoff) || p.UpdatedAt.After(cutoff) {
			continue
		}
		var refs int64
		db.Model(&models.OrderItem{}).Where("product_id = ?", p.ID).Count(&refs)
		if refs > 0 {
			db.Model(p).Update("is_active", false)
			hidden++
			continue
		}
		db.Delete(p)
		removed++
	}
	return removed, hidden
}

func seedOrders(db *gorm.DB) {
	var count int64
	db.Model(&models.Order{}).Count(&count)
	if count > 0 {
		return
	}
	var users []models.User
	db.Where("role = ?", models.RoleUser).Find(&users)
	var prods []models.Product
	db.Where("is_active = ?", true).Order("id ASC").Find(&prods)
	if len(users) == 0 || len(prods) < 10 {
		return
	}

	statuses := []string{models.OrderDelivered, models.OrderDelivered, models.OrderDelivering, models.OrderConfirmed, models.OrderPending, models.OrderPending, models.OrderCancelled, models.OrderDelivered}
	payments := []string{"cash", "card"}
	now := time.Now()
	total := 0
	for i := 0; i < 14; i++ {
		u := users[i%len(users)]
		n := 2 + i%4
		var items []models.OrderItem
		var subtotal float64
		cnt := 0
		for j := 0; j < n; j++ {
			p := prods[(i*17+j*31)%len(prods)]
			q := 1 + (i+j)%3
			line := utils.Round2(p.Price * float64(q))
			subtotal += line
			cnt += q
			items = append(items, models.OrderItem{
				ProductID: p.ID, Name: p.Name, Slug: p.Slug, Image: p.Image, Emoji: p.Emoji, Weight: p.Weight,
				Price: p.Price, Quantity: q, Total: line,
			})
		}
		subtotal = utils.Round2(subtotal)
		fee := 10.0
		if subtotal >= 200 {
			fee = 0
		}
		createdAt := now.Add(-time.Duration(i*11) * time.Hour)
		ord := models.Order{
			UserID: u.ID, Status: statuses[i%len(statuses)], Subtotal: subtotal, DeliveryFee: fee,
			Total: utils.Round2(subtotal + fee), ItemCount: cnt, Name: u.Name, Phone: u.Phone, Address: u.Address,
			PaymentMethod: payments[i%2], Items: items, CreatedAt: createdAt, UpdatedAt: createdAt,
		}
		if i%5 == 0 {
			ord.Note = "Gapyny kakmaň, jaň ediň"
		}
		if err := db.Create(&ord).Error; err != nil {
			continue
		}
		db.Model(&ord).Update("number", fmt.Sprintf("AZ%06d", ord.ID))
		uid := u.ID
		db.Create(&models.ActivityLog{UserID: &uid, UserEmail: u.Email, Action: "order.create", Entity: "order", EntityID: ord.ID, Level: "info",
			Message: fmt.Sprintf("Täze sargyt AZ%06d: %d haryt, jemi %.2f manat", ord.ID, cnt, ord.Total), IP: "127.0.0.1", CreatedAt: createdAt})
		total++
	}
	db.Create(&models.ActivityLog{Action: "seed.orders", Entity: "order", Level: "info", Message: fmt.Sprintf("%d nusga sargyt döredildi", total), IP: "127.0.0.1"})
	log.Printf("[SEED] %d sample orders created", total)
}
