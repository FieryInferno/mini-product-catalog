import { format } from 'date-fns'
import { PackageOpen } from 'lucide-react'

import { ErrorAlert } from '@/components/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import type { Product } from '@/types/product'

const SKELETON_ITEMS = 8

type ProductListProps = {
  products: Product[]
  isLoading: boolean
  error: string | null
  onProductSelect: (product: Product) => void
  onEditProduct: (productId: number) => void
}

function ProductListSkeleton() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: SKELETON_ITEMS }, (_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader>
            <Skeleton className="h-6 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full rounded-md" />
          </CardFooter>
        </Card>
      ))}
    </section>
  )
}

export function ProductList({ products, isLoading, error, onProductSelect, onEditProduct }: ProductListProps) {
  return (
    <>
      {error && <ErrorAlert message={error} title="Request failed" />}

      {isLoading ? (
        <ProductListSkeleton />
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group cursor-pointer transition-transform hover:-translate-y-1"
              onClick={() => onProductSelect(product)}
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
                    onEditProduct(product.id)
                  }}
                >
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))}

          {!products.length ? (
            <Empty className="col-span-full">
              <EmptyHeader>
                <PackageOpen className="h-5 w-5" />
                <EmptyTitle>No products found</EmptyTitle>
              </EmptyHeader>
              <EmptyDescription>No product found for this query.</EmptyDescription>
            </Empty>
          ) : null}
        </section>
      )}
    </>
  )
}
