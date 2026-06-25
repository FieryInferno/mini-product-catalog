import { Search } from 'lucide-react'
import { Suspense, lazy, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Pagination } from '@/components/Pagination'
import { ProductList } from '@/components/products/ProductList'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProductsQuery } from '@/hooks/product.hook'
import { useDebounce } from '@/lib/use-debounce'
import type { Product } from '@/models/product.model'

const LIMIT = 10
const ProductDialog = lazy(async () => {
  const module = await import('@/components/products/product-dialog')
  return { default: module.ProductDialog }
})

export function ProductListPage() {
  const navigate = useNavigate()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(search)
  const { data, error, isLoading } = useProductsQuery({
    search: debouncedSearch,
    page,
    limit: LIMIT,
  })

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const products = data?.data ?? []
  const totalPages = data?.total_pages ?? 0

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-secondary p-6 text-light shadow-lg">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Product Catalog</h1>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl border border-secondary/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary/50" />
          <Input
            className="pl-9"
            placeholder="Search by product name..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Button onClick={() => navigate('/add')}>Add Product</Button>
      </section>

      <ProductList
        products={products}
        isLoading={isLoading}
        error={error instanceof Error ? error.message : null}
        onProductSelect={setSelectedProduct}
        onEditProduct={(productId) => navigate(`/edit/${productId}`)}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
        onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        onPageChange={setPage}
      />

      <Suspense fallback={null}>
        <ProductDialog
          open={Boolean(selectedProduct)}
          product={selectedProduct}
          onOpenChange={(value) => {
            if (!value) setSelectedProduct(null)
          }}
        />
      </Suspense>
    </div>
  )
}
