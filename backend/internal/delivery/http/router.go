package router

import (
	"mini-product-catalog/backend/internal/delivery/http/handler"
	"net/http"
)

func InitializeRouter() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/products", handler.GetProducts)

	return mux
}
