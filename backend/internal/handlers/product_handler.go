package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"mini-product-catalog/backend/internal/models"

	"github.com/gorilla/mux"
)

type ProductHandler struct {
	db *sql.DB
}

type listResponse struct {
	Data  []models.Product `json:"data"`
	Total int              `json:"total"`
	Page  int              `json:"page"`
	Limit int              `json:"limit"`
}

type errorResponse struct {
	Message string `json:"message"`
}

func NewProductHandler(db *sql.DB) *ProductHandler {
	return &ProductHandler{db: db}
}

func (h *ProductHandler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/api/products", h.ListProducts).Methods(http.MethodGet)
	router.HandleFunc("/api/products/{id:[0-9]+}", h.GetProduct).Methods(http.MethodGet)
	router.HandleFunc("/api/products", h.CreateProduct).Methods(http.MethodPost)
	router.HandleFunc("/api/products/{id:[0-9]+}", h.UpdateProduct).Methods(http.MethodPut)
}

func (h *ProductHandler) ListProducts(w http.ResponseWriter, r *http.Request) {
	query := strings.TrimSpace(r.URL.Query().Get("search"))
	page := parseInt(r.URL.Query().Get("page"), 1)
	limit := parseInt(r.URL.Query().Get("limit"), 10)
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}
	offset := (page - 1) * limit

	countSQL := `SELECT COUNT(*) FROM products WHERE ($1 = '' OR name ILIKE '%' || $1 || '%')`
	var total int
	if err := h.db.QueryRow(countSQL, query).Scan(&total); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to count products")
		return
	}

	listSQL := `
		SELECT id, name, price, description, stock_quantity, created_at, updated_at
		FROM products
		WHERE ($1 = '' OR name ILIKE '%' || $1 || '%')
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`
	rows, err := h.db.Query(listSQL, query, limit, offset)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch products")
		return
	}
	defer rows.Close()

	products := make([]models.Product, 0, limit)
	for rows.Next() {
		var product models.Product
		err := rows.Scan(
			&product.ID,
			&product.Name,
			&product.Price,
			&product.Description,
			&product.StockQuantity,
			&product.CreatedAt,
			&product.UpdatedAt,
		)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to parse product")
			return
		}
		products = append(products, product)
	}

	_ = json.NewEncoder(w).Encode(listResponse{
		Data:  products,
		Total: total,
		Page:  page,
		Limit: limit,
	})
}

func (h *ProductHandler) GetProduct(w http.ResponseWriter, r *http.Request) {
	id, err := readID(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid product id")
		return
	}

	query := `
		SELECT id, name, price, description, stock_quantity, created_at, updated_at
		FROM products
		WHERE id = $1`
	var product models.Product
	err = h.db.QueryRow(query, id).Scan(
		&product.ID,
		&product.Name,
		&product.Price,
		&product.Description,
		&product.StockQuantity,
		&product.CreatedAt,
		&product.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "product not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to fetch product")
		return
	}

	_ = json.NewEncoder(w).Encode(product)
}

func (h *ProductHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	var input models.ProductInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request payload")
		return
	}
	if err := validateInput(input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	query := `
		INSERT INTO products (name, price, description, stock_quantity)
		VALUES ($1, $2, $3, $4)
		RETURNING id, name, price, description, stock_quantity, created_at, updated_at`
	var product models.Product
	err := h.db.QueryRow(
		query,
		strings.TrimSpace(input.Name),
		input.Price,
		strings.TrimSpace(input.Description),
		input.StockQuantity,
	).Scan(
		&product.ID,
		&product.Name,
		&product.Price,
		&product.Description,
		&product.StockQuantity,
		&product.CreatedAt,
		&product.UpdatedAt,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create product")
		return
	}

	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(product)
}

func (h *ProductHandler) UpdateProduct(w http.ResponseWriter, r *http.Request) {
	id, err := readID(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid product id")
		return
	}

	var input models.ProductInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request payload")
		return
	}
	if err := validateInput(input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	query := `
		UPDATE products
		SET name = $2,
			price = $3,
			description = $4,
			stock_quantity = $5,
			updated_at = NOW()
		WHERE id = $1
		RETURNING id, name, price, description, stock_quantity, created_at, updated_at`
	var product models.Product
	err = h.db.QueryRow(
		query,
		id,
		strings.TrimSpace(input.Name),
		input.Price,
		strings.TrimSpace(input.Description),
		input.StockQuantity,
	).Scan(
		&product.ID,
		&product.Name,
		&product.Price,
		&product.Description,
		&product.StockQuantity,
		&product.CreatedAt,
		&product.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		writeError(w, http.StatusNotFound, "product not found")
		return
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update product")
		return
	}

	_ = json.NewEncoder(w).Encode(product)
}

func readID(r *http.Request) (int64, error) {
	idParam := mux.Vars(r)["id"]
	return strconv.ParseInt(idParam, 10, 64)
}

func validateInput(input models.ProductInput) error {
	if strings.TrimSpace(input.Name) == "" {
		return errors.New("name is required")
	}
	if input.Price <= 0 {
		return errors.New("price must be greater than 0")
	}
	if strings.TrimSpace(input.Description) == "" {
		return errors.New("description is required")
	}
	if input.StockQuantity < 0 {
		return errors.New("stock_quantity cannot be negative")
	}
	return nil
}

func writeError(w http.ResponseWriter, status int, message string) {
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(errorResponse{Message: message})
}

func parseInt(raw string, fallback int) int {
	if raw == "" {
		return fallback
	}
	value, err := strconv.Atoi(raw)
	if err != nil {
		return fallback
	}
	return value
}
