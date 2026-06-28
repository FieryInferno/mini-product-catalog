package domain

import (
	"context"
	"time"
)

type Product struct {
	ID            int64     `json:"id"`
	Name          string    `json:"name"`
	Price         float64   `json:"price"`
	Description   string    `json:"description"`
	StockQuantity int       `json:"stock_quantity"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type FindAllQueryParams struct {
	Page    int
	Limit   int
	Search  string
	Filters map[string]interface{}
}

type Pagination struct {
	CurrentPage int   `json:"current_page"`
	PerPage     int   `json:"per_page"`
	TotalPages  int64 `json:"total_pages"`
	TotalItems  int   `json:"total_items"`
	HasNext     bool  `json:"has_next"`
	HasPrev     bool  `json:"has_prev"`
}

type ProductRepository interface {
	// Create(product *Product) (*Product, error)
	Read(ctx context.Context, params FindAllQueryParams) ([]Product, Pagination, error)
	// ReadByID(id int64) (*Product,s
}
