import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { Product } from '@/models/product.model'

type CardProductProps = {
  product: Product
  onSelect: (product: Product) => void
  onEdit: (productId: number) => void
}

export function CardProduct({ product, onSelect, onEdit }: CardProductProps) {
  return (
    <Card
      className="group cursor-pointer transition-transform hover:-translate-y-1"
      onClick={() => onSelect(product)}
    >
      <CardHeader>
        <CardTitle className="line-clamp-1 text-lg">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-secondary/80">
        <p>
          <span className="font-semibold">Price:</span> ${product.price.toFixed(2)}
        </p>
        <p>
          <span className="font-semibold">Stock:</span> {product.stock_quantity}
        </p>
        <p>
          <span className="font-semibold">Created:</span>{' '}
          {format(new Date(product.created_at), 'dd MMM yyyy')}
        </p>
        <p>
          <span className="font-semibold">Updated:</span>{' '}
          {format(new Date(product.updated_at), 'dd MMM yyyy')}
        </p>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant="secondary"
          onClick={(event) => {
            event.stopPropagation()
            onEdit(product.id)
          }}
        >
          Edit
        </Button>
      </CardFooter>
    </Card>
  )
}