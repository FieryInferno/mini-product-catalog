import { useState } from 'react'
import { useForm } from 'react-hook-form'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ProductPayload } from '@/types/product'

type ProductFormProps = {
  title: string
  submitLabel: string
  defaultValues?: ProductPayload
  isSubmitting: boolean
  onConfirmSubmit: (payload: ProductPayload) => Promise<void>
}

export function ProductForm({
  title,
  submitLabel,
  defaultValues,
  isSubmitting,
  onConfirmSubmit,
}: ProductFormProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingValues, setPendingValues] = useState<ProductPayload | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductPayload>({
    defaultValues: defaultValues ?? {
      name: '',
      price: 0,
      description: '',
      stock_quantity: 0,
    },
  })

  const onSubmit = (values: ProductPayload) => {
    setPendingValues(values)
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    if (!pendingValues) return
    await onConfirmSubmit(pendingValues)
    setConfirmOpen(false)
  }

  return (
    <>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-semibold text-secondary" htmlFor="name">
            Name
          </label>
          <Input
            id="name"
            placeholder="Type product name"
            {...register('name', {
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must contain at least 2 characters',
              },
            })}
          />
          {errors.name ? <p className="mt-1 text-xs text-accent">{errors.name.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-secondary" htmlFor="price">
            Price
          </label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            {...register('price', {
              valueAsNumber: true,
              required: 'Price is required',
              min: {
                value: 0.01,
                message: 'Price must be greater than 0',
              },
            })}
          />
          {errors.price ? <p className="mt-1 text-xs text-accent">{errors.price.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-secondary" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className="min-h-24 w-full rounded-md border border-secondary/20 px-3 py-2 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Describe your product"
            {...register('description', {
              required: 'Description is required',
              minLength: {
                value: 10,
                message: 'Description must contain at least 10 characters',
              },
            })}
          />
          {errors.description ? (
            <p className="mt-1 text-xs text-accent">{errors.description.message}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-secondary" htmlFor="stock_quantity">
            Stock Quantity
          </label>
          <Input
            id="stock_quantity"
            type="number"
            min="0"
            step="1"
            {...register('stock_quantity', {
              valueAsNumber: true,
              required: 'Stock quantity is required',
              min: {
                value: 0,
                message: 'Stock cannot be negative',
              },
              validate: {
                isInteger: (value) => Number.isInteger(value) || 'Stock must be an integer',
              },
            })}
          />
          {errors.stock_quantity ? (
            <p className="mt-1 text-xs text-accent">{errors.stock_quantity.message}</p>
          ) : null}
        </div>

        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </form>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>
              Please confirm this action. Data will be sent to the backend service.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isSubmitting} onClick={handleConfirm}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
