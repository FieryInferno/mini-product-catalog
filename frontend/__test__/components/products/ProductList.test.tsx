import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ProductList } from '@/components/products/ProductList'
import type { Product } from '@/models/product.model'

jest.mock('@/components/product/CardProduct', () => ({
  CardProduct: ({
    product,
    onSelect,
    onEdit,
  }: {
    product: Product
    onSelect: (product: Product) => void
    onEdit: (productId: number) => void
  }) => (
    <article data-testid={`card-product-${product.id}`}>
      <h3>{product.name}</h3>
      <button onClick={() => onSelect(product)}>Select {product.id}</button>
      <button onClick={() => onEdit(product.id)}>Edit {product.id}</button>
    </article>
  ),
}))

const products: Product[] = [
  {
    id: 1,
    name: 'Mouse',
    price: 39.9,
    description: 'Wireless mouse',
    stock_quantity: 14,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Keyboard',
    price: 79,
    description: 'Mechanical keyboard',
    stock_quantity: 5,
    created_at: '2026-01-03T00:00:00.000Z',
    updated_at: '2026-01-04T00:00:00.000Z',
  },
]

describe('ProductList', () => {
  it('renders loading skeleton state', () => {
    const { container } = render(
      <ProductList
        products={[]}
        isLoading
        error={null}
        onProductSelect={jest.fn()}
        onEditProduct={jest.fn()}
      />,
    )

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
    expect(screen.queryByText('No products found')).not.toBeInTheDocument()
  })

  it('renders empty state when no products exist and not loading', () => {
    render(
      <ProductList
        products={[]}
        isLoading={false}
        error={null}
        onProductSelect={jest.fn()}
        onEditProduct={jest.fn()}
      />,
    )

    expect(screen.getByText('No products found')).toBeInTheDocument()
    expect(screen.getByText('No product found for this query.')).toBeInTheDocument()
  })

  it('renders error alert when error is provided', () => {
    render(
      <ProductList
        products={[]}
        isLoading={false}
        error="Something went wrong"
        onProductSelect={jest.fn()}
        onEditProduct={jest.fn()}
      />,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Request failed')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders products and wires onSelect and onEdit callbacks', async () => {
    const user = userEvent.setup()
    const onProductSelect = jest.fn()
    const onEditProduct = jest.fn()

    render(
      <ProductList
        products={products}
        isLoading={false}
        error={null}
        onProductSelect={onProductSelect}
        onEditProduct={onEditProduct}
      />,
    )

    expect(await screen.findByTestId('card-product-1')).toBeInTheDocument()
    expect(await screen.findByTestId('card-product-2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Select 2' }))
    await user.click(screen.getByRole('button', { name: 'Edit 1' }))

    expect(onProductSelect).toHaveBeenCalledTimes(1)
    expect(onProductSelect).toHaveBeenCalledWith(products[1])
    expect(onEditProduct).toHaveBeenCalledTimes(1)
    expect(onEditProduct).toHaveBeenCalledWith(1)
  })
})
