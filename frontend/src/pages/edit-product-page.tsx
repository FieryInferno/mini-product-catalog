import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { ProductForm } from '@/components/products/product-form'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getProduct, updateProduct } from '@/lib/api'
import type { ProductPayload } from '@/types/product'

export function EditProductPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const productId = id
  const [defaultValues, setDefaultValues] = useState<ProductPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!productId) {
      setError('Invalid product id')
      setLoading(false)
      return
    }

    async function loadProduct() {
      const currentId = productId
      if (!currentId) {
        return
      }
      setError(null)
      setLoading(true)
      try {
        const product = await getProduct(currentId)
        setDefaultValues({
          name: product.name,
          price: product.price,
          description: product.description,
          stock_quantity: product.stock_quantity,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch product'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    void loadProduct()
  }, [productId])

  const handleUpdate = async (payload: ProductPayload) => {
    if (!productId) return
    setError(null)
    setIsSubmitting(true)
    try {
      await updateProduct(productId, payload)
      toast.success('Product updated successfully')
      navigate('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update product'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-secondary/10 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-secondary">Edit Product</h1>
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Backend Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <p className="text-sm text-secondary/70">Loading product data...</p>
      ) : defaultValues ? (
        <ProductForm
          title="Confirm Edit Product"
          submitLabel="Update Product"
          defaultValues={defaultValues}
          isSubmitting={isSubmitting}
          onConfirmSubmit={handleUpdate}
        />
      ) : null}
    </div>
  )
}
