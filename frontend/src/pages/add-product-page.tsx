import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { ProductForm } from '@/components/products/product-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { createProduct } from '@/lib/api'
import type { ProductPayload } from '@/types/product'

export function AddProductPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async (payload: ProductPayload) => {
    setError(null)
    setIsSubmitting(true)
    try {
      await createProduct(payload)
      toast.success('Product added successfully')
      navigate('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add product'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-secondary/10 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-secondary">Add Product</h1>
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Backend Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <ProductForm
        title="Confirm Add Product"
        submitLabel="Save Product"
        isSubmitting={isSubmitting}
        onConfirmSubmit={handleCreate}
      />
    </div>
  )
}
