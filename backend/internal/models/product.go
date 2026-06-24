package models

import "time"

type Product struct {
	ID           int64     `json:"id"`
	Name         string    `json:"name"`
	Price        float64   `json:"price"`
	Description  string    `json:"description"`
	StockQuantity int      `json:"stock_quantity"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type ProductInput struct {
	Name          string  `json:"name"`
	Price         float64 `json:"price"`
	Description   string  `json:"description"`
	StockQuantity int     `json:"stock_quantity"`
}
