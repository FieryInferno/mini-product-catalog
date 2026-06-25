import { render, screen, waitFor } from '@testing-library/react'
import { within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { ProductListPage } from '@/pages/ProductListPage'
import { useProductsQuery } from '@/hooks/product.hook'

jest.mock('@/hooks/product.hook', () => ({
  useProductsQuery: jest.fn(),
}))

jest.mock('@/lib/use-debounce', () => ({
  useDebounce: (value: string) => value,
}))

jest.mock('@/components/products/product-dialog', () => ({
  ProductDialog: ({
    open,
    product,
    onOpenChange,
  }: {
    open: boolean
    product: { name: string } | null
    onOpenChange: (value: boolean) => void
  }) =>
    open ? (
      <div data-testid="product-dialog">
        <p>Product dialog</p>
        <p>{product?.name}</p>
        <button onClick={() => onOpenChange(false)}>Close Dialog</button>
      </div>
    ) : null,
}))

const mockedUseProductsQuery = useProductsQuery as jest.MockedFunction<typeof useProductsQuery>

function buildProduct(page: number, search: string) {
  return {
    id: page,
    name: search ? `Filtered ${search}` : 'Mouse',
    price: 39.9,
    description: 'Wireless mouse',
    stock_quantity: 14,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-02T00:00:00.000Z',
  }
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<ProductListPage />} />
        <Route path="/add" element={<p>Add page</p>} />
        <Route path="/edit/:id" element={<p>Edit page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProductListPage integration', () => {
  beforeEach(() => {
    mockedUseProductsQuery.mockReset()
    mockedUseProductsQuery.mockImplementation((params) => ({
      data: {
        data: [buildProduct(params.page, params.search)],
        total_pages: 3,
        page: params.page,
        limit: params.limit,
      },
      error: null,
      isLoading: false,
    }) as ReturnType<typeof useProductsQuery>)
  })

  it('renders initial state and requests products with default query params', async () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Product Catalog' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search by product name...')).toHaveValue('')
    expect(await screen.findByText('Mouse')).toBeInTheDocument()

    expect(mockedUseProductsQuery).toHaveBeenCalledWith({
      search: '',
      page: 1,
      limit: 10,
    })
  })

  it('moves page via pagination and resets to page 1 when search changes', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Go to next page' }))

    await waitFor(() => {
      expect(mockedUseProductsQuery).toHaveBeenCalledWith({
        search: '',
        page: 2,
        limit: 10,
      })
    })

    await user.clear(screen.getByPlaceholderText('Search by product name...'))
    await user.type(screen.getByPlaceholderText('Search by product name...'), 'desk')

    await waitFor(() => {
      expect(mockedUseProductsQuery).toHaveBeenCalledWith({
        search: 'desk',
        page: 1,
        limit: 10,
      })
    })

    expect(await screen.findByText('Filtered desk')).toBeInTheDocument()
  })

  it('navigates to add and edit pages from page actions', async () => {
    const user = userEvent.setup()

    renderPage()
    await user.click(screen.getByRole('button', { name: 'Add Product' }))
    expect(await screen.findByText('Add page')).toBeInTheDocument()

    renderPage()
    await user.click(await screen.findByRole('button', { name: 'Edit' }))
    expect(await screen.findByText('Edit page')).toBeInTheDocument()
  })

  it('opens product dialog when selecting a product and closes it on onOpenChange(false)', async () => {
    const user = userEvent.setup()

    renderPage()
    await user.click(await screen.findByText('Mouse'))

    const dialog = await screen.findByTestId('product-dialog')
    expect(within(dialog).getByText('Product dialog')).toBeInTheDocument()
    expect(within(dialog).getByText('Mouse')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close Dialog' }))

    await waitFor(() => {
      expect(screen.queryByText('Product dialog')).not.toBeInTheDocument()
    })
  })
})
