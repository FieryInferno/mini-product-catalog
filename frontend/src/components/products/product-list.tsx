import { lazy, Suspense } from 'react'
import { PackageOpen } from 'lucide-react'

import { ErrorAlert } from '@/components/alert'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import type { Product } from '@/types/product'

const SKELETON_ITEMS = 8
const CardProduct = lazy(() => import('@/components/product/CardProduct').then((module) => ({ default: module.CardProduct })))

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

function EmptyProducts() {
  return (
    <Empty className="col-span-full">
      <EmptyHeader>
        <PackageOpen className="h-5 w-5" />
        <EmptyTitle>No products found</EmptyTitle>
      </EmptyHeader>
      <EmptyDescription>No product found for this query.</EmptyDescription>
    </Empty>
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
          <Suspense fallback={<ProductListSkeleton />}>
            {products.map((product) => (
              <CardProduct
                key={product.id}
                product={product}
                onSelect={onProductSelect}
                onEdit={onEditProduct}
              />
            ))}
          </Suspense>

          {!products.length ? <EmptyProducts /> : null}
        </section>
      )}
    </>
  )
}
