import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type ErrorAlertProps = {
  message: string | null
  title?: string
}

export function ErrorAlert({ message, title }: ErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}