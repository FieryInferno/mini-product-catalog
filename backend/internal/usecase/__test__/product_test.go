package usecase_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"mini-product-catalog/backend/internal/domain"
	"mini-product-catalog/backend/internal/usecase"

	"github.com/stretchr/testify/require"
)

type mockProductRepository struct {
	readFn      func(ctx context.Context, params domain.FindAllQueryParams) ([]domain.Product, error)
	callCount   int
	lastCtx     context.Context
	lastParams  domain.FindAllQueryParams
	returnItems []domain.Product
	returnErr   error
}

func (m *mockProductRepository) Read(ctx context.Context, params domain.FindAllQueryParams) ([]domain.Product, error) {
	m.callCount++
	m.lastCtx = ctx
	m.lastParams = params

	if m.readFn != nil {
		return m.readFn(ctx, params)
	}
	if m.returnErr != nil {
		return nil, m.returnErr
	}
	return m.returnItems, nil
}

func sampleProducts() []domain.Product {
	now := time.Date(2026, 6, 28, 12, 0, 0, 0, time.UTC)
	return []domain.Product{
		{
			ID:            1,
			Name:          "Laptop",
			Price:         1200,
			Description:   "High-end laptop",
			StockQuantity: 4,
			CreatedAt:     now,
			UpdatedAt:     now,
		},
		{
			ID:            2,
			Name:          "Mouse",
			Price:         25,
			Description:   "Wireless mouse",
			StockQuantity: 20,
			CreatedAt:     now,
			UpdatedAt:     now,
		},
	}
}

func TestNewProductUsecase_StoresRepositoryDependency(t *testing.T) {
	repo := &mockProductRepository{returnItems: sampleProducts()}
	u := usecase.NewProductUsecase(repo)
	require.NotNil(t, u)

	_, err := u.GetProducts(context.Background(), domain.FindAllQueryParams{})
	require.NoError(t, err)
	require.Equal(t, 1, repo.callCount)
}

func TestGetProducts_Success_ReturnsProductsUnchanged(t *testing.T) {
	expected := sampleProducts()
	repo := &mockProductRepository{returnItems: expected}
	u := usecase.NewProductUsecase(repo)

	result, err := u.GetProducts(context.Background(), domain.FindAllQueryParams{})
	require.NoError(t, err)
	require.Equal(t, expected, result)
	require.Equal(t, 1, repo.callCount)
}

func TestGetProducts_Success_EmptyResult(t *testing.T) {
	repo := &mockProductRepository{returnItems: []domain.Product{}}
	u := usecase.NewProductUsecase(repo)

	result, err := u.GetProducts(context.Background(), domain.FindAllQueryParams{})
	require.NoError(t, err)
	require.Empty(t, result)
	require.Equal(t, 1, repo.callCount)
}

func TestGetProducts_ForwardsContextAndParams(t *testing.T) {
	repo := &mockProductRepository{returnItems: sampleProducts()}
	u := usecase.NewProductUsecase(repo)

	ctx := context.WithValue(context.Background(), "request-id", "req-1")
	params := domain.FindAllQueryParams{
		Page:   3,
		Limit:  10,
		Search: "Laptop",
		Filters: map[string]interface{}{
			"min_price": 100.0,
			"max_price": 2000.0,
			"in_stock":  true,
		},
	}

	_, err := u.GetProducts(ctx, params)
	require.NoError(t, err)
	require.Equal(t, 1, repo.callCount)
	require.Equal(t, ctx, repo.lastCtx)
	require.Equal(t, params, repo.lastParams)
}

func TestGetProducts_Error_PropagatesRepositoryError(t *testing.T) {
	expectedErr := errors.New("repository read failed")
	repo := &mockProductRepository{returnErr: expectedErr}
	u := usecase.NewProductUsecase(repo)

	result, err := u.GetProducts(context.Background(), domain.FindAllQueryParams{})
	require.Error(t, err)
	require.Nil(t, result)
	require.ErrorIs(t, err, expectedErr)
	require.Equal(t, 1, repo.callCount)
}

func TestGetProducts_ContextCancelled_PropagatesError(t *testing.T) {
	repo := &mockProductRepository{
		readFn: func(ctx context.Context, _ domain.FindAllQueryParams) ([]domain.Product, error) {
			if err := ctx.Err(); err != nil {
				return nil, err
			}
			return []domain.Product{}, nil
		},
	}
	u := usecase.NewProductUsecase(repo)

	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	result, err := u.GetProducts(ctx, domain.FindAllQueryParams{})
	require.Error(t, err)
	require.Nil(t, result)
	require.ErrorIs(t, err, context.Canceled)
	require.Equal(t, 1, repo.callCount)
}

func TestGetProducts_EdgeCases_ParamsPassThrough(t *testing.T) {
	tests := []struct {
		name   string
		params domain.FindAllQueryParams
	}{
		{
			name: "zero values",
			params: domain.FindAllQueryParams{
				Page:  0,
				Limit: 0,
			},
		},
		{
			name: "negative values",
			params: domain.FindAllQueryParams{
				Page:  -1,
				Limit: -5,
			},
		},
		{
			name: "special characters in search",
			params: domain.FindAllQueryParams{
				Page:   1,
				Limit:  10,
				Search: "%_'\" OR 1=1 --",
				Filters: map[string]interface{}{
					"unknown_filter": "value",
				},
			},
		},
		{
			name: "nil filters",
			params: domain.FindAllQueryParams{
				Page:    1,
				Limit:   20,
				Search:  "",
				Filters: nil,
			},
		},
		{
			name: "large limit",
			params: domain.FindAllQueryParams{
				Page:   1,
				Limit:  1_000_000,
				Search: "monitor",
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repo := &mockProductRepository{returnItems: sampleProducts()}
			u := usecase.NewProductUsecase(repo)

			result, err := u.GetProducts(context.Background(), tt.params)
			require.NoError(t, err)
			require.Equal(t, sampleProducts(), result)
			require.Equal(t, 1, repo.callCount)
			require.Equal(t, tt.params, repo.lastParams)
		})
	}
}

func TestNewProductUsecase_PotentialFutureValidation_NilRepositoryShouldBeRejected(t *testing.T) {
	t.Skip("TODO: enable after constructor validates non-nil repository")

	u := usecase.NewProductUsecase(nil)
	require.Nil(t, u)
}

func TestGetProducts_PotentialFutureValidation_NilContextShouldBeRejected(t *testing.T) {
	t.Skip("TODO: enable after usecase validates non-nil context")

	repo := &mockProductRepository{returnItems: sampleProducts()}
	u := usecase.NewProductUsecase(repo)

	_, err := u.GetProducts(nil, domain.FindAllQueryParams{})
	require.Error(t, err)
}

func TestGetProducts_PotentialFutureValidation_InvalidPageShouldError(t *testing.T) {
	t.Skip("TODO: enable after usecase validates page >= 1")

	repo := &mockProductRepository{returnItems: sampleProducts()}
	u := usecase.NewProductUsecase(repo)

	_, err := u.GetProducts(context.Background(), domain.FindAllQueryParams{Page: 0, Limit: 10})
	require.Error(t, err)
}

func TestGetProducts_PotentialFutureValidation_InvalidLimitShouldError(t *testing.T) {
	t.Skip("TODO: enable after usecase validates limit bounds")

	repo := &mockProductRepository{returnItems: sampleProducts()}
	u := usecase.NewProductUsecase(repo)

	_, err := u.GetProducts(context.Background(), domain.FindAllQueryParams{Page: 1, Limit: -1})
	require.Error(t, err)
}

func TestGetProducts_PotentialFutureValidation_InvalidProductDataShouldError(t *testing.T) {
	t.Skip("TODO: enable after usecase validates product data returned by repository")

	repo := &mockProductRepository{returnItems: []domain.Product{{ID: 1, Name: "", Price: -1, StockQuantity: -2}}}
	u := usecase.NewProductUsecase(repo)

	_, err := u.GetProducts(context.Background(), domain.FindAllQueryParams{})
	require.Error(t, err)
}
