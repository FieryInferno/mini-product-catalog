import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Pagination } from '@/components/pagination'
import { ProductList } from '@/components/products/product-list'
import { ProductDialog } from '@/components/products/product-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { listProducts } from '@/lib/api'
import { useDebounce } from '@/lib/use-debounce'
import type { Product } from '@/types/product'

const LIMIT = 10

export function ProductListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const debouncedSearch = useDebounce(search)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      setError(null)
      try {
        const response = await listProducts({ search: debouncedSearch, page, limit: LIMIT })
        setProducts(response.data)
        setTotal(response.total)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch products'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    void loadProducts()
  }, [debouncedSearch, page])

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))
  const pages = useMemo(() => {
    const output: number[] = []
    const start = Math.max(1, page - 2)
    const end = Math.min(totalPages, page + 2)
    for (let i = start; i <= end; i++) {
      output.push(i)
    }
    return output
  }, [page, totalPages])

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
        isLoading={loading}
        error={error}
        onProductSelect={setSelectedProduct}
        onEditProduct={(productId) => navigate(`/edit/${productId}`)}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        pages={pages}
        onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
        onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        onPageChange={setPage}
      />

      <ProductDialog
        open={Boolean(selectedProduct)}
        product={selectedProduct}
        onOpenChange={(value) => {
          if (!value) setSelectedProduct(null)
        }}
      />
    </div>
  )
}
