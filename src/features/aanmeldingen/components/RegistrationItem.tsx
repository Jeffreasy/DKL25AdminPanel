import { useState } from 'react'
import {
    CheckCircleIcon,
    UserIcon,
    MapPinIcon,
    HandRaisedIcon,
    ArrowPathIcon,
    EnvelopeIcon,
    ClipboardDocumentIcon,
    CheckIcon
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
  const [isCopied, setIsCopied] = useState(false)

  const handleStatusUpdate = async (newStatus: Aanmelding['status']) => {
    setLoading(true)
    try {
      const { error } = await updateAanmelding(registration.id, {
        status: newStatus,
        behandeld_op: newStatus !== 'nieuw' ? new Date().toISOString() : null
      })
      if (error) {
        console.error('Error updating status:', error)
      } else {
        onStatusUpdate()
      }
    } catch (err) {
      console.error('Error in handleStatusUpdate:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Aanmelding['status']) => {
    switch (status) {
      case 'nieuw': return 'orange'
      case 'in_behandeling': return 'blue'
      case 'behandeld': return 'green'
      case 'geannuleerd': return 'red'
      default: return 'gray'
    }
  }

  const getStatusText = (status: Aanmelding['status']) => {
    switch (status) {
      case 'nieuw': return 'Nieuw'
      case 'in_behandeling': return 'In behandeling'
      case 'behandeld': return 'Behandeld'
      case 'geannuleerd': return 'Geannuleerd'
      default: return status
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

  const handleCopyEmail = async () => {
    if (!registration.email) return;
    try {
      await navigator.clipboard.writeText(registration.email);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500); 
    } catch (err) {
      console.error('Failed to copy email: ', err);
    }
  };

  const roleIcon = UserIcon;
  const distanceIcon = MapPinIcon;
  const supportIcon = HandRaisedIcon;

  return (
    <div 
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 sm:p-6 w-full"
    >
      <div className="space-y-4">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:items-start sm:gap-4">
          <div className="space-y-1 flex-shrink-0">
            <h3 className="font-medium text-lg text-gray-900 dark:text-white">{registration.naam}</h3>
            <div className="flex items-center gap-1">
              <a 
                href={`mailto:${registration.email}`}
                title={`Mail ${registration.email}`}
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline break-all"
              >
                <EnvelopeIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>{registration.email}</span>
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                title={isCopied ? "Gekopieerd!" : "Kopieer email"}
                className="p-1 rounded-md text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 flex-shrink-0"
              >
                <span className="sr-only">Kopieer e-mailadres</span>
                {isCopied ? (
                  <CheckIcon className="h-4 w-4 text-green-500" aria-hidden="true" />
                ) : (
                  <ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {registration.telefoon && (
              <p className="text-sm text-gray-500 dark:text-gray-500"> 
                {`• ${registration.telefoon}`}
              </p>
            )}
          </div>
          
          <div className="flex-shrink-0 w-full sm:w-auto">
            <div className="flex flex-col gap-2">
              <span className={cc.badge({
                color: getStatusColor(registration.status),
                className: 'inline-flex items-center gap-1.5 w-full sm:w-auto justify-center'
              })}>
                {getStatusText(registration.status)}
              </span>
              {registration.status === 'nieuw' && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleStatusUpdate('in_behandeling')}
                  className={cl(
                    cc.button.base({ color: 'secondary', size: 'sm', className: 'text-xs flex items-center gap-1.5 w-full sm:w-auto justify-center' }),
                    loading && "opacity-75 cursor-not-allowed"
                  )}
                >
                  {loading ? (
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  ) : (
                      <CheckCircleIcon className="w-4 h-4" />
                  )}
                  Start behandeling
                </button>
              )}
            </div>
          </div>
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
        
        <div className="flex flex-col items-start gap-1 sm:flex-row sm:justify-between sm:items-center mt-2">
           <p className="text-xs text-gray-500 dark:text-gray-400">
             Aangemeld op: {formatDate(registration.created_at)}
           </p>
           {registration.behandeld_op && (
             <p className="text-xs text-gray-500 dark:text-gray-400">
               Behandeld op: {formatDate(registration.behandeld_op)}
             </p>
           )}
         </div>
      </div>
    </div>
  )
} 