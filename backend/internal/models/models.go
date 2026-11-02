package models

import "time"

// ---------- Users ----------

const (
	RoleUser  = "user"
	RoleAdmin = "admin"
)

type User struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	Name      string     `gorm:"size:120;not null" json:"name"`
	Email     string     `gorm:"size:191;uniqueIndex;not null" json:"email"`
	Password  string     `gorm:"size:255;not null" json:"-"`
	Phone     string     `gorm:"size:40" json:"phone"`
	Address   string     `gorm:"size:255" json:"address"`
	Role      string     `gorm:"size:20;default:user;index" json:"role"`
	IsActive  bool       `gorm:"default:true" json:"is_active"`
	LastLogin *time.Time `json:"last_login"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`

	OrderCount int64 `gorm:"-" json:"order_count"`
}

func (u *User) IsAdmin() bool { return u.Role == RoleAdmin }

// ---------- Catalog ----------

type Category struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:120;not null" json:"name"`
	Slug        string    `gorm:"size:191;uniqueIndex;not null" json:"slug"`
	Emoji       string    `gorm:"size:16" json:"emoji"`
	Image       string    `gorm:"size:255" json:"image"`
	Description string    `gorm:"size:500" json:"description"`
	Color       string    `gorm:"size:20" json:"color"`
	SortOrder   int       `gorm:"default:0;index" json:"sort_order"`
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	ProductCount int64 `gorm:"-" json:"product_count"`
}

type Product struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"size:200;not null;index" json:"name"`
	Slug        string    `gorm:"size:191;uniqueIndex;not null" json:"slug"`
	Description string    `gorm:"type:text" json:"description"`
	Brand       string    `gorm:"size:100;index" json:"brand"`
	Price       float64   `gorm:"not null;index" json:"price"`
	OldPrice    float64   `gorm:"default:0" json:"old_price"`
	Unit        string    `gorm:"size:20;default:sany" json:"unit"`
	Weight      string    `gorm:"size:40" json:"weight"`
	Stock       int       `gorm:"default:0" json:"stock"`
	Sold        int       `gorm:"default:0;index" json:"sold"`
	Image       string    `gorm:"size:255" json:"image"`
	Emoji       string    `gorm:"size:16" json:"emoji"`
	CategoryID  uint      `gorm:"index;not null" json:"category_id"`
	Category    *Category `json:"category,omitempty"`
	IsFeatured  bool      `gorm:"default:false;index" json:"is_featured"`
	IsActive    bool      `gorm:"default:true;index" json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ---------- Orders ----------

const (
	OrderPending    = "pending"
	OrderConfirmed  = "confirmed"
	OrderDelivering = "delivering"
	OrderDelivered  = "delivered"
	OrderCancelled  = "cancelled"
)

var OrderStatuses = []string{OrderPending, OrderConfirmed, OrderDelivering, OrderDelivered, OrderCancelled}

func IsValidOrderStatus(s string) bool {
	for _, v := range OrderStatuses {
		if v == s {
			return true
		}
	}
	return false
}

type Order struct {
	ID            uint        `gorm:"primaryKey" json:"id"`
	Number        string      `gorm:"size:30;uniqueIndex" json:"number"`
	UserID        uint        `gorm:"index;not null" json:"user_id"`
	User          *User       `json:"user,omitempty"`
	Status        string      `gorm:"size:20;default:pending;index" json:"status"`
	Subtotal      float64     `json:"subtotal"`
	DeliveryFee   float64     `json:"delivery_fee"`
	Total         float64     `json:"total"`
	ItemCount     int         `json:"item_count"`
	Name          string      `gorm:"size:120" json:"name"`
	Phone         string      `gorm:"size:40" json:"phone"`
	Address       string      `gorm:"size:255" json:"address"`
	Note          string      `gorm:"size:500" json:"note"`
	PaymentMethod string      `gorm:"size:20;default:cash" json:"payment_method"`
	Items         []OrderItem `json:"items"`
	CreatedAt     time.Time   `gorm:"index" json:"created_at"`
	UpdatedAt     time.Time   `json:"updated_at"`
}

type OrderItem struct {
	ID        uint     `gorm:"primaryKey" json:"id"`
	OrderID   uint     `gorm:"index;not null" json:"order_id"`
	ProductID uint     `gorm:"index" json:"product_id"`
	Product   *Product `json:"product,omitempty"`
	Name      string   `gorm:"size:200" json:"name"`
	Slug      string   `gorm:"size:191" json:"slug"`
	Image     string   `gorm:"size:255" json:"image"`
	Emoji     string   `gorm:"size:16" json:"emoji"`
	Weight    string   `gorm:"size:40" json:"weight"`
	Price     float64  `json:"price"`
	Quantity  int      `json:"quantity"`
	Total     float64  `json:"total"`
}

// ---------- Logs ----------

type ActivityLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    *uint     `gorm:"index" json:"user_id"`
	UserEmail string    `gorm:"size:191;index" json:"user_email"`
	Action    string    `gorm:"size:60;index;not null" json:"action"`
	Entity    string    `gorm:"size:40;index" json:"entity"`
	EntityID  uint      `gorm:"index" json:"entity_id"`
	Level     string    `gorm:"size:10;default:info;index" json:"level"`
	Message   string    `gorm:"size:500" json:"message"`
	Details   string    `gorm:"type:text" json:"details"`
	IP        string    `gorm:"size:64" json:"ip"`
	UserAgent string    `gorm:"size:255" json:"user_agent"`
	CreatedAt time.Time `gorm:"index" json:"created_at"`
}

// ---------- Site settings ----------

type Setting struct {
	Key       string    `gorm:"primaryKey;size:60" json:"key"`
	Value     string    `gorm:"type:text" json:"value"`
	UpdatedAt time.Time `json:"updated_at"`
}
