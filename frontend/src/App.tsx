import { Link, Navigate, Route, Routes } from 'react-router-dom'

import { Toaster } from '@/components/ui/sonner'
import { AddProductPage } from '@/pages/add-product-page'
import { EditProductPage } from '@/pages/edit-product-page'
import { ProductListPage } from '@/pages/ProductListPage'

function App() {
  return (
    <div className="min-h-screen bg-app-pattern px-4 py-8 sm:px-6 lg:px-10">
      <main className="mx-auto w-full max-w-7xl space-y-6">
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/add" element={<AddProductPage />} />
          <Route path="/edit/:id" element={<EditProductPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <div className="text-center text-xs text-secondary/70">
          Back to <Link to="/" className="font-semibold text-accent">Product List</Link>
        </div>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  )
}

export default App
