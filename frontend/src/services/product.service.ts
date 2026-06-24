import { request } from '@/lib/api'
import { productListResponse } from '@/models/product.model'

export function getProducts(params: { search: string; page: number; limit: number }) {
  const query = new URLSearchParams({
    search: params.search,
    page: String(params.page),
    limit: String(params.limit),
  })

  return request(`/api/products?${query.toString()}`, productListResponse)
}