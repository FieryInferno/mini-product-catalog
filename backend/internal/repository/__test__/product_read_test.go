package repository_test

import (
	"context"
	"database/sql"
	"regexp"
	"testing"
	"time"

	"mini-product-catalog/backend/internal/domain"
	"mini-product-catalog/backend/internal/repository"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/stretchr/testify/require"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func newRepoWithMock(t *testing.T) (domain.ProductRepository, sqlmock.Sqlmock, *sql.DB) {
	t.Helper()

	sqlDB, mock, err := sqlmock.New()
	require.NoError(t, err)

	gormDB, err := gorm.Open(postgres.New(postgres.Config{
		Conn:                 sqlDB,
		PreferSimpleProtocol: true,
	}), &gorm.Config{})
	require.NoError(t, err)

	return repository.NewProductRepository(gormDB), mock, sqlDB
}

func TestProductRepositoryRead_SuccessBasicRead(t *testing.T) {
	repo, mock, sqlDB := newRepoWithMock(t)
	defer sqlDB.Close()

	now := time.Now().UTC().Truncate(time.Second)
	rows := sqlmock.NewRows([]string{"id", "name", "price", "description", "stock_quantity", "created_at", "updated_at"}).
		AddRow(1, "Laptop", 1200.50, "High-end laptop", 5, now, now).
		AddRow(2, "Mouse", 25.00, "Wireless mouse", 30, now, now)

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "products" WHERE "products"."deleted_at" IS NULL ORDER BY id ASC LIMIT $1`)).
		WithArgs(10).
		WillReturnRows(rows)

	result, err := repo.Read(context.Background(), domain.FindAllQueryParams{})
	require.NoError(t, err)
	require.Len(t, result, 2)
	require.Equal(t, int64(1), result[0].ID)
	require.Equal(t, "Laptop", result[0].Name)
	require.Equal(t, 1200.50, result[0].Price)
	require.Equal(t, "High-end laptop", result[0].Description)
	require.Equal(t, 5, result[0].StockQuantity)

	require.NoError(t, mock.ExpectationsWereMet())
}

func TestProductRepositoryRead_Pagination(t *testing.T) {
	repo, mock, sqlDB := newRepoWithMock(t)
	defer sqlDB.Close()

	rows := sqlmock.NewRows([]string{"id", "name", "price", "description", "stock_quantity", "created_at", "updated_at"}).
		AddRow(3, "Keyboard", 70.00, "Mechanical keyboard", 8, time.Now(), time.Now())

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "products" WHERE "products"."deleted_at" IS NULL ORDER BY id ASC LIMIT $1 OFFSET $2`)).
		WithArgs(2, 2).
		WillReturnRows(rows)

	result, err := repo.Read(context.Background(), domain.FindAllQueryParams{Page: 2, Limit: 2})
	require.NoError(t, err)
	require.Len(t, result, 1)
	require.Equal(t, int64(3), result[0].ID)

	require.NoError(t, mock.ExpectationsWereMet())
}

func TestProductRepositoryRead_SearchKeyword(t *testing.T) {
	repo, mock, sqlDB := newRepoWithMock(t)
	defer sqlDB.Close()

	rows := sqlmock.NewRows([]string{"id", "name", "price", "description", "stock_quantity", "created_at", "updated_at"}).
		AddRow(5, "Desk Lamp", 40.00, "Lamp for office", 12, time.Now(), time.Now())

	mock.ExpectQuery(`SELECT \* FROM "products" WHERE \(LOWER\(name\) LIKE \$1 AND "products"\."deleted_at" IS NULL ORDER BY id ASC LIMIT \$2`).
		WithArgs("%lamp%", 10).
		WillReturnRows(rows)

	result, err := repo.Read(context.Background(), domain.FindAllQueryParams{Search: "Lamp"})
	require.NoError(t, err)
	require.Len(t, result, 1)
	require.Equal(t, "Desk Lamp", result[0].Name)

	require.NoError(t, mock.ExpectationsWereMet())
}

func TestProductRepositoryRead_FiltersMap(t *testing.T) {
	repo, mock, sqlDB := newRepoWithMock(t)
	defer sqlDB.Close()

	rows := sqlmock.NewRows([]string{"id", "name", "price", "description", "stock_quantity", "created_at", "updated_at"}).
		AddRow(7, "Monitor", 350.00, "27 inch monitor", 3, time.Now(), time.Now())

	mock.ExpectQuery(`SELECT \* FROM "products" WHERE stock_quantity > \$1 AND price <= \$2 AND price >= \$3 AND "products"\."deleted_at" IS NULL ORDER BY id ASC LIMIT \$4`).
		WithArgs(0, 500.0, 100.0, 10).
		WillReturnRows(rows)

	result, err := repo.Read(context.Background(), domain.FindAllQueryParams{
		Filters: map[string]interface{}{
			"in_stock":  true,
			"max_price": 500.0,
			"min_price": 100.0,
		},
	})
	require.NoError(t, err)
	require.Len(t, result, 1)
	require.Equal(t, "Monitor", result[0].Name)

	require.NoError(t, mock.ExpectationsWereMet())
}

func TestProductRepositoryRead_DBError(t *testing.T) {
	repo, mock, sqlDB := newRepoWithMock(t)
	defer sqlDB.Close()

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT * FROM "products" WHERE "products"."deleted_at" IS NULL ORDER BY id ASC LIMIT $1`)).
		WithArgs(10).
		WillReturnError(sql.ErrConnDone)

	result, err := repo.Read(context.Background(), domain.FindAllQueryParams{})
	require.Error(t, err)
	require.Nil(t, result)
	require.ErrorIs(t, err, sql.ErrConnDone)

	require.NoError(t, mock.ExpectationsWereMet())
}
