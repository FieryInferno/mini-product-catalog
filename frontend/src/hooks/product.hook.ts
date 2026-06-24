import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { getProducts } from '@/services/product.service'

export function useProductsQuery(params: { search: string; page: number; limit: number }) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
    placeholderData: keepPreviousData,
  })
}