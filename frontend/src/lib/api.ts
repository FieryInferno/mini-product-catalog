import type { ApiError, Product, ProductListResponse, ProductPayload } from '@/types/product'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    let message = 'Unexpected server error'
    try {
      const data = (await response.json()) as ApiError
      message = data.message ?? message
    } catch {
      // Ignore JSON parsing errors and keep fallback message.
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export function listProducts(params: { search: string; page: number; limit: number }) {
  const query = new URLSearchParams({
    search: params.search,
    page: String(params.page),
    limit: String(params.limit),
  })
  return request<ProductListResponse>(`/api/products?${query.toString()}`)
}

export function getProduct(id: string) {
  return request<Product>(`/api/products/${id}`)
}

export function createProduct(payload: ProductPayload) {
  return request<Product>('/api/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateProduct(id: string, payload: ProductPayload) {
  return request<Product>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
