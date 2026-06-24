export type Product = {
  id: number
  name: string
  price: number
  description: string
  stock_quantity: number
  created_at: string
  updated_at: string
}

export type ProductPayload = {
  name: string
  price: number
  description: string
  stock_quantity: number
}

export type ProductListResponse = {
  data: Product[]
  total: number
  page: number
  limit: number
}

export type ApiError = {
  message: string
}
