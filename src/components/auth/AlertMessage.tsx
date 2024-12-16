import { ErrorText, SuccessText } from '../typography'

interface AlertMessageProps {
  type: 'error' | 'success'
  message: string
}

export function AlertMessage({ type, message }: AlertMessageProps) {
  return (
    <div className={`rounded-md ${type === 'error' ? 'bg-red-50' : 'bg-green-50'} p-4 animate-fadeIn`}>
      {type === 'error' ? <ErrorText>{message}</ErrorText> : <SuccessText>{message}</SuccessText>}
    </div>
  )
} 