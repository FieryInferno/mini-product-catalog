package usecase

import (
	"context"
	"mini-product-catalog/backend/internal/domain"
)

type ProductUsecase struct {
	repository domain.ProductRepository
}

func NewProductUsecase(repository domain.ProductRepository) *ProductUsecase {
	return &ProductUsecase{repository: repository}
}

func (u *ProductUsecase) GetProducts(ctx context.Context, params domain.FindAllQueryParams) ([]domain.Product, domain.Pagination, error) {
	products, pagination, err := u.repository.Read(ctx, params)

	if err != nil {
		return nil, domain.Pagination{}, err
	}

	return products, pagination, nil
}
