package repository

import (
	"context"
	"fmt"
	"mini-product-catalog/backend/internal/domain"
	"strings"

	"gorm.io/gorm"
)

type ProductRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) domain.ProductRepository {
	return &ProductRepository{db: db}
}

func (r ProductRepository) Read(ctx context.Context, params domain.FindAllQueryParams) ([]domain.Product, domain.Pagination, error) {
	if params.Limit <= 0 {
		params.Limit = 10
	}

	query := gorm.G[domain.Product](r.db).Order("id ASC")

	var search string

	if params.Search != "" {
		search = fmt.Sprintf("%%%s%%", strings.ToLower(params.Search))
		query = query.Where("(LOWER(name) LIKE ?", search)
	}
	if params.Filters != nil {
		for key, value := range params.Filters {
			switch key {
			case "min_price":
				query = query.Where("price >= ?", value)
			case "max_price":
				query = query.Where("price <= ?", value)
			case "in_stock":
				query = query.Where("stock_quantity > ?", 0)
			}
		}
	}

	queryPagination := query.Limit(params.Limit).Offset((params.Page - 1) * params.Limit)
	totalCount, err := query.Count(ctx, "*")
	products, err := queryPagination.Find(ctx)

	if err != nil {
		return nil, domain.Pagination{}, err
	}

	return products, domain.Pagination{
		CurrentPage: params.Page,
		PerPage:     params.Limit,
		TotalPages:  totalCount / int64(params.Limit),
		TotalItems:  int(totalCount),
		HasNext:     int64(params.Page*params.Limit) < totalCount,
		HasPrev:     params.Page > 1,
	}, nil
}
