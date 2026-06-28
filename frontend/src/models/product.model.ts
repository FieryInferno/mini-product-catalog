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
  message: z.string(),
  success: z.boolean(),
  pagination: z.object({
    current_page: z.number(),
    has_next: z.boolean(),
    has_prev: z.boolean(),
    per_page: z.number(),
    total_items: z.number(),
    total_pages: z.number(),
  })
})

export type Product = z.infer<typeof productSchema>

export type ProductPayload = z.infer<typeof productPayloadSchema>

export type ProductListResponse = z.infer<typeof productListResponse>