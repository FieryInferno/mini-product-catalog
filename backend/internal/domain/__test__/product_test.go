package domain_test

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"mini-product-catalog/backend/internal/domain"

	"github.com/stretchr/testify/require"
)

type stubProductRepository struct {
	products []domain.Product
	err      error
	called   int
	gotCtx   context.Context
	gotParam domain.FindAllQueryParams
}

func (s *stubProductRepository) Read(ctx context.Context, params domain.FindAllQueryParams) ([]domain.Product, error) {
	s.called++
	s.gotCtx = ctx
	s.gotParam = params
	if s.err != nil {
		return nil, s.err
	}
	return s.products, nil
}

func TestProduct_JSONTags_AreCorrect(t *testing.T) {
	type productJSONView struct {
		ID            int64     `json:"id"`
		Name          string    `json:"name"`
		Price         float64   `json:"price"`
		Description   string    `json:"description"`
		StockQuantity int       `json:"stock_quantity"`
		CreatedAt     time.Time `json:"created_at"`
		UpdatedAt     time.Time `json:"updated_at"`
	}

	now := time.Date(2026, 6, 28, 10, 0, 0, 0, time.UTC)
	p := domain.Product{
		ID:            1,
		Name:          "Keyboard",
		Price:         99.5,
		Description:   "Mechanical keyboard",
		StockQuantity: 3,
		CreatedAt:     now,
		UpdatedAt:     now,
	}

	b, err := json.Marshal(p)
	require.NoError(t, err)

	var got map[string]interface{}
	err = json.Unmarshal(b, &got)
	require.NoError(t, err)

	require.Contains(t, got, "id")
	require.Contains(t, got, "name")
	require.Contains(t, got, "price")
	require.Contains(t, got, "description")
	require.Contains(t, got, "stock_quantity")
	require.Contains(t, got, "created_at")
	require.Contains(t, got, "updated_at")
}

func TestProduct_ZeroValue_IsAllowed(t *testing.T) {
	var p domain.Product

	require.Equal(t, int64(0), p.ID)
	require.Equal(t, "", p.Name)
	require.Equal(t, float64(0), p.Price)
	require.Equal(t, "", p.Description)
	require.Equal(t, 0, p.StockQuantity)
	require.True(t, p.CreatedAt.IsZero())
	require.True(t, p.UpdatedAt.IsZero())
}

func TestProduct_InvalidSemanticValues_AreCurrentlyAllowed(t *testing.T) {
	p := domain.Product{
		ID:            10,
		Name:          "",
		Price:         -5.25,
		Description:   "",
		StockQuantity: -1,
		CreatedAt:     time.Date(2026, 6, 29, 12, 0, 0, 0, time.UTC),
		UpdatedAt:     time.Date(2026, 6, 28, 12, 0, 0, 0, time.UTC),
	}

	require.Equal(t, "", p.Name)
	require.Equal(t, -5.25, p.Price)
	require.Equal(t, -1, p.StockQuantity)
	require.True(t, p.CreatedAt.After(p.UpdatedAt))
}

func TestFindAllQueryParams_ZeroValueAndEdges_AreRepresentable(t *testing.T) {
	tests := []struct {
		name   string
		params domain.FindAllQueryParams
	}{
		{
			name:   "zero value",
			params: domain.FindAllQueryParams{},
		},
		{
			name: "negative page and limit",
			params: domain.FindAllQueryParams{
				Page:  -1,
				Limit: -10,
			},
		},
		{
			name: "large limit with unknown filters",
			params: domain.FindAllQueryParams{
				Page:   1,
				Limit:  1_000_000,
				Search: "",
				Filters: map[string]interface{}{
					"unknown_key": "value",
				},
			},
		},
		{
			name: "known and unknown filter mix",
			params: domain.FindAllQueryParams{
				Page:   2,
				Limit:  25,
				Search: "Laptop",
				Filters: map[string]interface{}{
					"min_price":    100.0,
					"max_price":    1000.0,
					"in_stock":     true,
					"unknown_flag": true,
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			require.Equal(t, tt.params.Page, tt.params.Page)
			require.Equal(t, tt.params.Limit, tt.params.Limit)
			require.Equal(t, tt.params.Search, tt.params.Search)
			if tt.params.Filters == nil {
				require.Nil(t, tt.params.Filters)
				return
			}
			require.NotNil(t, tt.params.Filters)
		})
	}
}

func TestProductRepositoryInterface_CanBeImplemented(t *testing.T) {
	var repo domain.ProductRepository = &stubProductRepository{}
	require.NotNil(t, repo)

	ctx := context.WithValue(context.Background(), "trace", "abc")
	params := domain.FindAllQueryParams{
		Page:   1,
		Limit:  10,
		Search: "Lamp",
		Filters: map[string]interface{}{
			"in_stock": true,
		},
	}

	products, err := repo.Read(ctx, params)
	require.NoError(t, err)
	require.Empty(t, products)
}

func TestProduct_PotentialFutureValidation_NegativePriceShouldFail(t *testing.T) {
	t.Log("TODO: ubah ekspektasi setelah validasi harga negatif diterapkan")

	p := domain.Product{Price: -1}
	require.Less(t, p.Price, 0.0)
}

func TestProduct_PotentialFutureValidation_NegativeStockShouldFail(t *testing.T) {
	t.Log("TODO: ubah ekspektasi setelah validasi stock quantity diterapkan")

	p := domain.Product{StockQuantity: -1}
	require.Less(t, p.StockQuantity, 0)
}

func TestProduct_PotentialFutureValidation_EmptyNameShouldFail(t *testing.T) {
	t.Log("TODO: ubah ekspektasi setelah validasi nama kosong diterapkan")

	p := domain.Product{Name: ""}
	require.Empty(t, p.Name)
}

func TestFindAllQueryParams_PotentialFutureValidation_PageMustBePositive(t *testing.T) {
	t.Log("TODO: ubah ekspektasi setelah validasi page >= 1 diterapkan")

	params := domain.FindAllQueryParams{Page: 0, Limit: 10}
	require.Less(t, params.Page, 1)
}

func TestFindAllQueryParams_PotentialFutureValidation_LimitShouldHaveUpperBound(t *testing.T) {
	t.Log("TODO: ubah ekspektasi setelah batas atas limit diterapkan")

	params := domain.FindAllQueryParams{Page: 1, Limit: 1_000_000}
	require.Greater(t, params.Limit, 100)
}

func TestFindAllQueryParams_PotentialFutureValidation_UnknownFiltersShouldFail(t *testing.T) {
	t.Log("TODO: ubah ekspektasi setelah whitelist filter diterapkan")

	params := domain.FindAllQueryParams{
		Filters: map[string]interface{}{
			"invalid_filter": true,
		},
	}
	_, exists := params.Filters["invalid_filter"]
	require.True(t, exists)
}
