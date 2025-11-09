import { useState } from 'react'
import { updateAanmelding } from '../services/aanmeldingenService'
import type { Aanmelding } from '../types'
import { cc } from '../../../styles/shared'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

interface RegistrationItemProps {
  registration: Aanmelding
  onStatusUpdate: () => void
  canWrite?: boolean
}

export function RegistrationItem({ registration, onStatusUpdate, canWrite = false }: RegistrationItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async (newStatus: Aanmelding['status']) => {
    if (newStatus === registration.status) return;
    
    setIsUpdating(true)
    try {
      await updateAanmelding(registration.id, {
        status: newStatus,
        behandeld_op: newStatus !== 'nieuw' ? new Date().toISOString() : null
      })
      onStatusUpdate()
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'nieuw': return 'orange'
      case 'beantwoord': return 'yellow' // Use yellow instead of purple since purple isn't supported
      case 'in_behandeling': return 'blue'
      case 'behandeld': return 'green'
      case 'geannuleerd': return 'red'
      default: return 'gray'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'nieuw': return 'Nieuw'
      case 'beantwoord': return 'Beantwoord'
      case 'in_behandeling': return 'In behandeling'
      case 'behandeld': return 'Behandeld'
      case 'geannuleerd': return 'Geannuleerd'
      default: return status
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${cc.hover.card}`}>
      {/* Card Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-white">{registration.naam}</h3>
              <span className={cc.badge({ color: getStatusColor(registration.status) })}>
                {getStatusLabel(registration.status)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-indigo-100 dark:text-indigo-200">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {registration.email}
              </div>
              {registration.telefoon && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {registration.telefoon}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`bg-white/20 hover:bg-white/30 rounded-lg p-2 ${cc.transition.colors}`}
          >
            <svg 
              className={`w-5 h-5 text-white ${cc.transition.transform} ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className={`${cc.spacing.container.md} ${cc.spacing.section.sm}`}>
        {/* Quick Info Grid */}
        <div className={`${cc.grid.compact()} gap-4`}>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Rol</p>
            <span className={cc.badge({ color: 'blue' })}>
              {registration.rol}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Afstand</p>
            <span className={cc.badge({ color: 'gray' })}>
              {registration.afstand}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ondersteuning</p>
            <span className={cc.badge({ color: registration.ondersteuning === 'Ja' ? 'green' : 'gray' })}>
              {registration.ondersteuning}
            </span>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className={`pt-4 border-t border-gray-200 dark:border-gray-700 ${cc.spacing.section.sm}`}>
            {/* Bijzonderheden */}
            {registration.bijzonderheden && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Bijzonderheden</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  {registration.bijzonderheden}
                </p>
              </div>
            )}

            {/* Notities */}
            {registration.notities && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Notities</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  {registration.notities}
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className={`${cc.grid.twoCol()} gap-3 text-xs text-gray-500 dark:text-gray-400`}>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Aangemeld: {format(new Date(registration.created_at), 'dd MMM yyyy HH:mm', { locale: nl })}
              </div>
              {registration.behandeld_op && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Behandeld: {format(new Date(registration.behandeld_op), 'dd MMM yyyy HH:mm', { locale: nl })}
                </div>
              )}
              {registration.behandeld_door && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Door: {registration.behandeld_door}
                </div>
              )}
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email verzonden: {registration.email_verzonden ? 'Ja' : 'Nee'}
              </div>
            </div>

            {/* Status Selector */}
            {canWrite && (
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Status wijzigen
                </label>
                <select
                  value={registration.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  disabled={isUpdating}
                  className={cc.form.select({ className: 'text-sm' })}
                >
                  <option value="nieuw">Nieuw</option>
                  <option value="beantwoord">Beantwoord</option>
                  <option value="in_behandeling">In behandeling</option>
                  <option value="behandeld">Behandeld</option>
                  <option value="geannuleerd">Geannuleerd</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions Footer (when collapsed) */}
      {!isExpanded && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={cc.badge({ color: 'blue' })}>
              {registration.rol}
            </span>
            <span className={cc.badge({ color: 'gray' })}>
              {registration.afstand}
            </span>
          </div>
          {canWrite && (registration.status === 'nieuw' || registration.status === 'beantwoord') && (
            <button
              onClick={() => handleStatusUpdate('in_behandeling')}
              disabled={isUpdating}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 disabled:opacity-50 ${cc.transition.colors}`}
            >
              {isUpdating ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Bezig...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Start behandeling
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}