import type React from 'react'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      toastOptions={{
        style: {
          background: '#EAEAEA',
          color: '#252A34',
          border: '1px solid #08D9D6',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
