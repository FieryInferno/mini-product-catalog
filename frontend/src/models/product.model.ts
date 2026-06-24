import { z } from 'zod'

export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  description: z.string(),
  stock_quantity: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const productPayloadSchema = productSchema.pick({
  name: true,
  price: true,
  description: true,
  stock_quantity: true,
})

export const productListResponse = z.object({
  data: z.array(productSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

export type Product = z.infer<typeof productSchema>

export type ProductPayload = z.infer<typeof productPayloadSchema>

export type ProductListResponse = z.infer<typeof productListResponse>