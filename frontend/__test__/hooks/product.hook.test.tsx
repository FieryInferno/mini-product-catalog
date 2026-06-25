import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { useProductsQuery } from '@/hooks/product.hook'
import { getProducts } from '@/services/product.service'
import type { ProductListResponse } from '@/models/product.model'

jest.mock('@/services/product.service', () => ({
  getProducts: jest.fn(),
}))

const mockedGetProducts = getProducts as jest.MockedFunction<typeof getProducts>

function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return { wrapper, queryClient }
}

describe('useProductsQuery', () => {
  const params = { search: 'mouse', page: 1, limit: 10 }

  beforeEach(() => {
    mockedGetProducts.mockReset()
  })

  it('returns loading state while request is pending', () => {
    const pendingPromise = new Promise<never>(() => {})
    mockedGetProducts.mockReturnValue(pendingPromise)

    const { wrapper, queryClient } = createQueryWrapper()
    const { result } = renderHook(() => useProductsQuery(params), { wrapper })

    expect(result.current.isLoading).toBe(true)
    expect(mockedGetProducts).toHaveBeenCalledWith(params)

    queryClient.clear()
  })

  it('returns success state with data', async () => {
    const response: ProductListResponse = {
      data: [
        {
          id: 1,
          name: 'Mouse',
          price: 19.9,
          description: 'Wireless mouse',
          stock_quantity: 9,
          created_at: '2026-01-01T00:00:00.000Z',
          updated_at: '2026-01-02T00:00:00.000Z',
        },
      ],
      total_pages: 1,
      page: 1,
      limit: 10,
    }

    mockedGetProducts.mockResolvedValue(response)

    const { wrapper, queryClient } = createQueryWrapper()
    const { result } = renderHook(() => useProductsQuery(params), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(response)

    queryClient.clear()
  })

  it('returns error state when service rejects', async () => {
    const error = new Error('Request failed')
    mockedGetProducts.mockRejectedValue(error)

    const { wrapper, queryClient } = createQueryWrapper()
    const { result } = renderHook(() => useProductsQuery(params), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBe(error)

    queryClient.clear()
  })
})
