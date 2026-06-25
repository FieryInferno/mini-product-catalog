import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Pagination } from '@/components/Pagination'

describe('Pagination', () => {
  it('does not render when totalPages is 1 or less', () => {
    render(
      <Pagination
        page={1}
        totalPages={1}
        onPrevious={jest.fn()}
        onNext={jest.fn()}
        onPageChange={jest.fn()}
      />,
    )

    expect(screen.queryByRole('navigation', { name: 'pagination' })).not.toBeInTheDocument()
  })

  it('renders page window around current page', () => {
    render(
      <Pagination
        page={5}
        totalPages={10}
        onPrevious={jest.fn()}
        onNext={jest.fn()}
        onPageChange={jest.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '7' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '8' })).not.toBeInTheDocument()
  })

  it('disables previous button on first page and next button on last page', () => {
    const { rerender } = render(
      <Pagination
        page={1}
        totalPages={3}
        onPrevious={jest.fn()}
        onNext={jest.fn()}
        onPageChange={jest.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Go to previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Go to next page' })).not.toBeDisabled()

    rerender(
      <Pagination
        page={3}
        totalPages={3}
        onPrevious={jest.fn()}
        onNext={jest.fn()}
        onPageChange={jest.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: 'Go to previous page' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Go to next page' })).toBeDisabled()
  })

  it('fires previous, next, and page change callbacks', async () => {
    const user = userEvent.setup()
    const onPrevious = jest.fn()
    const onNext = jest.fn()
    const onPageChange = jest.fn()

    render(
      <Pagination
        page={2}
        totalPages={5}
        onPrevious={onPrevious}
        onNext={onNext}
        onPageChange={onPageChange}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Go to previous page' }))
    await user.click(screen.getByRole('button', { name: 'Go to next page' }))
    await user.click(screen.getByRole('button', { name: '3' }))

    expect(onPrevious).toHaveBeenCalledTimes(1)
    expect(onNext).toHaveBeenCalledTimes(1)
    expect(onPageChange).toHaveBeenCalledTimes(1)
    expect(onPageChange).toHaveBeenCalledWith(3)
  })
})
