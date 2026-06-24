import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

function Empty({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex min-h-40 w-full flex-col items-center justify-center rounded-xl border border-dashed border-secondary/30 bg-white p-10 text-center text-secondary/70',
        className,
      )}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mb-3 flex flex-col items-center gap-1', className)} {...props} />
}

function EmptyTitle({ className, ...props }: ComponentProps<'h3'>) {
  return <h3 className={cn('text-base font-semibold text-secondary', className)} {...props} />
}

function EmptyDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-sm text-secondary/70', className)} {...props} />
}

function EmptyContent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('mt-3', className)} {...props} />
}

export { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle }