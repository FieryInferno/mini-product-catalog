import {
  Pagination as PaginationComponent,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useMemo } from 'react'

type PaginationProps = {
  page: number
  totalPages: number
  onPrevious: () => void
  onNext: () => void
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  totalPages,
  onPrevious,
  onNext,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = useMemo(() => {
    const output: number[] = []
    const start = Math.max(1, page - 2)
    const end = Math.min(totalPages, page + 2)

    for (let i = start; i <= end; i++) output.push(i)

    return output
  }, [page, totalPages])

  return (
    <PaginationComponent>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={onPrevious} disabled={page === 1} />
        </PaginationItem>
        {pages.map((pageNumber) => (
          <PaginationItem key={pageNumber}>
            <PaginationLink
              isActive={pageNumber === page}
              onClick={() => onPageChange(pageNumber)}
              disabled={pageNumber === page}
            >
              {pageNumber}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext onClick={onNext} disabled={page === totalPages} />
        </PaginationItem>
      </PaginationContent>
    </PaginationComponent>
  )
}
