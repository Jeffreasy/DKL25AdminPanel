import { useState } from 'react'
import { 
    CheckCircleIcon, 
    PaperAirplaneIcon, 
    UserIcon, 
    MapPinIcon, 
    HandRaisedIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline'
import { updateAanmelding } from './../services/aanmeldingenService'
import type { Aanmelding } from './../types'
import type { ElementType } from 'react'
import { cl } from '../../../styles/shared'
import { cc } from '../../../styles/shared'

interface RegistrationItemProps {
  registration: Aanmelding
  onStatusUpdate: () => void
}

function DetailItem({ label, value, icon: Icon }: { label: string; value: string | number | null | undefined; icon: ElementType }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div className="flex flex-col">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm text-gray-900 dark:text-white">{value || '-'}</p>
      </div>
    </div>
  )
}

export function RegistrationItem({ registration, onStatusUpdate }: RegistrationItemProps) {
  const [loading, setLoading] = useState(false)

  const handleEmailVerzonden = async () => {
    setLoading(true)
    try {
      const { error } = await updateAanmelding(registration.id, {
        email_verzonden: true,
        email_verzonden_op: new Date().toISOString()
      })
      if (error) {
        console.error('Error updating email status:', error)
      } else {
        onStatusUpdate()
      }
    } catch (err) {
      console.error('Error in handleEmailVerzonden:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('nl-NL', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  const roleIcon = UserIcon;
  const distanceIcon = MapPinIcon;
  const supportIcon = HandRaisedIcon;

  return (
    <div 
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 w-full"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-0">
            <h3 className="font-medium text-lg text-gray-900 dark:text-white">{registration.naam}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {registration.email}
              {registration.telefoon && ` • ${registration.telefoon}`}
            </p>
          </div>
          
          {registration.email_verzonden ? (
            <span className={cc.badge({ color: 'green', className: 'inline-flex items-center gap-1.5' })}>
              <CheckCircleIcon className="h-3.5 w-3.5" />
              Email verzonden
            </span>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleEmailVerzonden}
              className={cl(
                cc.button.base({ color: 'secondary', size: 'sm', className: 'text-xs flex items-center gap-1.5' }),
                loading && "opacity-75 cursor-not-allowed"
              )}
            >
              {loading ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : (
                  <PaperAirplaneIcon className="w-4 h-4 -rotate-45" />
              )}
              Markeer als verzonden
            </button>
          )}
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        <div className="space-y-3">
          <DetailItem label="Rol" value={registration.rol} icon={roleIcon} />
          <DetailItem label="Afstand" value={registration.afstand} icon={distanceIcon} />
          <DetailItem label="Ondersteuning" value={registration.ondersteuning} icon={supportIcon} />
        </div>

        {registration.bijzonderheden && (
          <>
            <hr className="border-gray-200 dark:border-gray-700" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bijzonderheden</p>
              <p className="text-sm whitespace-pre-line text-gray-800 dark:text-gray-200">
                {registration.bijzonderheden}
              </p>
            </div>
          </>
        )}

        {!registration.bijzonderheden && <hr className="border-gray-200 dark:border-gray-700" />}
        
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Aangemeld op: {formatDate(registration.created_at)}
          </p>
          {registration.email_verzonden_op && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Email verzonden op: {formatDate(registration.email_verzonden_op)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 