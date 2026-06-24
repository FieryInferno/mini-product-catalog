import { z } from 'zod'

import { productSchema } from '@/models/product.model'
import type { ProductPayload } from '@/models/product.model'

type ApiError = { message: string }
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

export class ApiResponseValidationError extends Error {
  readonly issues: z.ZodIssue[]

  constructor(message: string, issues: z.ZodIssue[]) {
    super(message)
    this.name = 'ApiResponseValidationError'
    this.issues = issues
  }
}

export async function request<Schema extends z.ZodTypeAny>(
  path: string,
  schema: Schema,
  init?: RequestInit,
): Promise<z.infer<Schema>> {
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

  const data: unknown = await response.json()
  const parsed = schema.safeParse(data)

  if (!parsed.success) {
    console.error('API response validation failed', {
      path,
      issues: parsed.error.issues,
      data,
    })
    throw new ApiResponseValidationError('Invalid API response shape', parsed.error.issues)
  }

  return parsed.data
}

export function getProduct(id: string) {
  return request(`/api/products/${id}`, productSchema)
}

export function createProduct(payload: ProductPayload) {
  return request('/api/products', productSchema, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateProduct(id: string, payload: ProductPayload) {
  return request(`/api/products/${id}`, productSchema, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
