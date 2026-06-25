import { request } from '@/lib/api'
import { productListResponse, type ProductListResponse } from '@/models/product.model'
import { getProducts } from '@/services/product.service'

jest.mock('@/lib/api', () => ({
  request: jest.fn(),
}))

const mockedRequest = request as jest.MockedFunction<typeof request>

describe('getProducts', () => {
  beforeEach(() => {
    mockedRequest.mockReset()
  })

  it('calls request with the expected endpoint and schema', async () => {
    const params = { search: 'wireless mouse', page: 2, limit: 12 }
    const expectedQuery = new URLSearchParams({
      search: params.search,
      page: String(params.page),
      limit: String(params.limit),
    }).toString()

    const response: ProductListResponse = {
      data: [],
      total_pages: 0,
      page: 2,
      limit: 12,
    }

    mockedRequest.mockResolvedValue(response)

    await getProducts(params)

    expect(mockedRequest).toHaveBeenCalledTimes(1)
    expect(mockedRequest).toHaveBeenCalledWith(`/api/products?${expectedQuery}`, productListResponse)
  })

  it('returns data on successful request', async () => {
    const params = { search: 'keyboard', page: 1, limit: 10 }
    const response: ProductListResponse = {
      data: [
        {
          id: 1,
          name: 'Keyboard',
          price: 55,
          description: 'Mechanical keyboard',
          stock_quantity: 8,
          created_at: '2026-01-03T00:00:00.000Z',
          updated_at: '2026-01-04T00:00:00.000Z',
        },
      ],
      total_pages: 1,
      page: 1,
      limit: 10,
    }

    mockedRequest.mockResolvedValue(response)

    await expect(getProducts(params)).resolves.toEqual(response)
  })

  it('propagates request errors', async () => {
    const params = { search: 'speaker', page: 3, limit: 5 }
    const error = new Error('Network error')

    mockedRequest.mockRejectedValue(error)

    await expect(getProducts(params)).rejects.toThrow('Network error')
  })
})
