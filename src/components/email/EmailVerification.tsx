import { useState } from 'react'
import { adminEmailService } from '../../features/email/adminEmailService'

interface EmailVerificationProps {
  email: string
  onVerified: () => void
}

export function EmailVerification({ email, onVerified }: EmailVerificationProps) {
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResendVerification = async () => {
    try {
      setVerifying(true)
      setError(null)
      await adminEmailService.verifyEmailAddress(email)
      onVerified()
    } catch (err) {
      console.error('Email verification failed:', err)
      setError('Kon verificatie email niet versturen. Probeer het later opnieuw.')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="rounded-md bg-blue-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm text-blue-700">
            Er is een verificatie email verstuurd naar {email}.
            Klik op de link in de email om je adres te verifiëren.
          </p>
          <p className="mt-3 text-sm md:mt-0 md:ml-6">
            <button
              onClick={handleResendVerification}
              disabled={verifying}
              className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600"
            >
              {verifying ? 'Versturen...' : 'Opnieuw versturen'}
            </button>
          </p>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
} 