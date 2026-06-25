import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { format } from 'date-fns'

import { CardProduct } from '@/components/product/CardProduct'
import type { Product } from '@/models/product.model'

jest.mock('date-fns', () => ({
  format: jest.fn(),
}))

const mockedFormat = format as jest.MockedFunction<typeof format>

const product: Product = {
  id: 1,
  name: 'Wireless Keyboard',
  price: 129.99,
  description: 'Low profile keyboard',
  stock_quantity: 23,
  created_at: '2026-01-10T12:00:00.000Z',
  updated_at: '2026-01-15T12:00:00.000Z',
}

describe('CardProduct', () => {
  beforeEach(() => {
    mockedFormat.mockReset()
    mockedFormat.mockReturnValueOnce('10 Jan 2026').mockReturnValueOnce('15 Jan 2026')
  })

  it('renders product details with formatted values', () => {
    render(<CardProduct product={product} onSelect={jest.fn()} onEdit={jest.fn()} />)

    expect(screen.getByText('Wireless Keyboard')).toBeInTheDocument()
    expect(screen.getByText('$129.99')).toBeInTheDocument()
    expect(screen.getByText('23')).toBeInTheDocument()
    expect(screen.getByText('10 Jan 2026')).toBeInTheDocument()
    expect(screen.getByText('15 Jan 2026')).toBeInTheDocument()

    expect(mockedFormat).toHaveBeenNthCalledWith(1, new Date(product.created_at), 'dd MMM yyyy')
    expect(mockedFormat).toHaveBeenNthCalledWith(2, new Date(product.updated_at), 'dd MMM yyyy')
  })

  it('calls onSelect when the card is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = jest.fn()

    render(<CardProduct product={product} onSelect={onSelect} onEdit={jest.fn()} />)

    await user.click(screen.getByText('Wireless Keyboard'))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(product)
  })

  it('calls onEdit and prevents bubbling to onSelect when edit is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = jest.fn()
    const onEdit = jest.fn()

    render(<CardProduct product={product} onSelect={onSelect} onEdit={onEdit} />)

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledWith(product.id)
    expect(onSelect).not.toHaveBeenCalled()
  })
})
