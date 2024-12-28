import { useState } from 'react'
import { updateAanmelding } from '../features/aanmeldingen/services/aanmeldingenService'
import type { Aanmelding } from '../features/aanmeldingen/types'
import { SmallText } from './typography'

interface RegistrationItemProps {
  registration: Aanmelding
  onStatusUpdate: () => void
}

export function RegistrationItem({ registration, onStatusUpdate }: RegistrationItemProps) {
  const [loading, setLoading] = useState(false)

  const handleEmailVerzonden = async () => {
    try {
      setLoading(true)
      const { error } = await updateAanmelding(registration.id, {
        email_verzonden: true,
        email_verzonden_op: new Date().toISOString()
      })
      if (error) throw error
      onStatusUpdate()
    } catch (err) {
      console.error('Error updating email status:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header met naam en email */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {registration.naam}
            </h3>
            <SmallText>
              {registration.email}
              {registration.telefoon && ` • ${registration.telefoon}`}
            </SmallText>
          </div>
          <div className="flex items-center gap-2">
            {!registration.email_verzonden ? (
              <button
                onClick={handleEmailVerzonden}
                disabled={loading}
                className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 
                  dark:text-indigo-300 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900/70 
                  transition-colors disabled:opacity-50"
              >
                {loading ? 'Bezig...' : 'Markeer als verzonden'}
              </button>
            ) : (
              <span className="px-3 py-1 text-sm bg-green-100 text-green-700 dark:bg-green-900/50 
                dark:text-green-300 rounded-full">
                Email verzonden
              </span>
            )}
          </div>
        </div>

        {/* Details grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Rol</span>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{registration.rol}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Afstand</span>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{registration.afstand}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Ondersteuning</span>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">{registration.ondersteuning}</p>
          </div>
        </div>

        {/* Bijzonderheden als die er zijn */}
        {registration.bijzonderheden && (
          <div className="mt-4">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Bijzonderheden
            </span>
            <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-line">
              {registration.bijzonderheden}
            </p>
          </div>
        )}

        {/* Footer met metadata */}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <span>
            Aangemeld op {new Date(registration.created_at).toLocaleDateString('nl-NL')}
          </span>
          {registration.email_verzonden_op && (
            <span>
              Email verzonden op {new Date(registration.email_verzonden_op).toLocaleDateString('nl-NL')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
} 