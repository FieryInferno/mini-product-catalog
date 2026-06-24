import {
  Pagination as PaginationComponent,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

type PaginationProps = {
  page: number
  totalPages: number
  pages: number[]
  onPrevious: () => void
  onNext: () => void
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  totalPages,
  pages,
  onPrevious,
  onNext,
  onPageChange,
}: PaginationProps) {
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
