import { format } from 'date-fns'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Product } from '@/types/product'

type ProductDialogProps = {
  product: Product | null
  open: boolean
  onOpenChange: (value: boolean) => void
}

export function ProductDialog({ product, open, onOpenChange }: ProductDialogProps) {
  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>Detailed product information</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-sm text-secondary">
          <p>
            <span className="font-medium">Price:</span> ${product.price.toFixed(2)}
          </p>
          <p>
            <span className="font-medium">Stock:</span> {product.stock_quantity}
          </p>
          <p>
            <span className="font-medium">Description:</span> {product.description}
          </p>
          <p>
            <span className="font-medium">Created:</span>{' '}
            {format(new Date(product.created_at), 'dd MMM yyyy, HH:mm')}
          </p>
          <p>
            <span className="font-medium">Updated:</span>{' '}
            {format(new Date(product.updated_at), 'dd MMM yyyy, HH:mm')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
