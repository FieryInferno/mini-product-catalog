package handler

import (
	"encoding/json"
	"log"
	"mini-product-catalog/backend/config"
	"mini-product-catalog/backend/internal/domain"
	"mini-product-catalog/backend/internal/repository"
	"mini-product-catalog/backend/internal/usecase"
	"net/http"
	"strconv"
)

type Response[T any] struct {
	Success    bool              `json:"success"`
	Message    string            `json:"message"`
	Data       T                 `json:"data"`
	Pagination domain.Pagination `json:"pagination,omitempty"`
}

func GetProducts(w http.ResponseWriter, r *http.Request) {
	productRepository := repository.NewProductRepository(config.DB)
	productUsecase := usecase.NewProductUsecase(productRepository)

	var page, limit int

	page, _ = strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ = strconv.Atoi(r.URL.Query().Get("limit"))

	products, pagination, err := productUsecase.GetProducts(r.Context(), domain.FindAllQueryParams{
		Page:   page,
		Limit:  limit,
		Search: r.URL.Query().Get("search"),
	})

	var response Response[[]domain.Product]

	if err != nil {
		log.Printf("Error retrieving products: %v", err)
		response = Response[[]domain.Product]{
			Success: false,
			Message: "Failed to get products",
			Data:    nil,
		}
	} else {
		response = Response[[]domain.Product]{
			Success:    true,
			Message:    "Products retrieved successfully",
			Data:       products,
			Pagination: pagination,
		}
	}

	w.Header().Set("Content-Type", "application/json")

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
	} else {
		w.WriteHeader(http.StatusOK)
	}

	json.NewEncoder(w).Encode(response)
}
