import { render, screen } from '@testing-library/react'

import { ErrorAlert } from '@/components/Alert'

describe('ErrorAlert', () => {
  it('renders title and message in a destructive alert', () => {
    render(<ErrorAlert title="Request failed" message="Something went wrong" />)

    const alert = screen.getByRole('alert')

    expect(alert).toBeInTheDocument()
    expect(alert).toHaveClass('border-accent/30')
    expect(screen.getByText('Request failed')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders message when title is omitted', () => {
    render(<ErrorAlert message="Only message" />)

    const alert = screen.getByRole('alert')

    expect(alert).toBeInTheDocument()
    expect(screen.getByText('Only message')).toBeInTheDocument()
    expect(alert.querySelector('h5')).toBeInTheDocument()
  })
})
