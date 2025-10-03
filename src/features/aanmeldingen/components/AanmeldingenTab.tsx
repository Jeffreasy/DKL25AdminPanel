import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { updateAanmelding } from '../services/aanmeldingenService'
import type { DashboardContext } from '../../../types/dashboard'
import type { Aanmelding } from '../types'

function StatusBadge({ status }: { status: Aanmelding['status'] }) {
  const getStatusColor = (status: Aanmelding['status']) => {
    switch (status) {
      case 'nieuw': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'in_behandeling': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'behandeld': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'geannuleerd': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
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

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
      {getStatusText(status)}
    </span>
  )
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function AanmeldingenTab() {
  const { stats, aanmeldingen, handleUpdate } = useOutletContext<DashboardContext>()
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  // Detect screen size
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      if (width < 768) {
        setScreenSize('mobile')
      } else if (width < 1024) {
        setScreenSize('tablet')
      } else {
        setScreenSize('desktop')
      }
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  const handleStatusChange = async (id: string, newStatus: Aanmelding['status']) => {
    try {
      await updateAanmelding(id, { status: newStatus, behandeld_op: newStatus !== 'nieuw' ? new Date().toISOString() : null })
      handleUpdate()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const toggleCardExpansion = (id: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCards(newExpanded)
  }

  // Mobile Card View
  const MobileView = () => (
    <div className="space-y-4">
      {aanmeldingen.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Geen aanmeldingen gevonden
        </div>
      ) : (
        aanmeldingen.map((aanmelding) => (
          <div key={aanmelding.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{aanmelding.naam}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{aanmelding.email}</p>
                  {aanmelding.telefoon && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{aanmelding.telefoon}</p>
                  )}
                </div>
                <StatusBadge status={aanmelding.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Rol:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{aanmelding.rol}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Afstand:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{aanmelding.afstand}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Ondersteuning:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{aanmelding.ondersteuning}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Email verzonden:</span>
                  <span className={`ml-2 ${aanmelding.email_verzonden ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {aanmelding.email_verzonden ? 'Ja' : 'Nee'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleCardExpansion(aanmelding.id)}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
              >
                {expandedCards.has(aanmelding.id) ? 'Minder details' : 'Meer details'}
              </button>

              {expandedCards.has(aanmelding.id) && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  {aanmelding.bijzonderheden && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Bijzonderheden:</span>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">{aanmelding.bijzonderheden}</p>
                    </div>
                  )}
                  {aanmelding.notities && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Notities:</span>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">{aanmelding.notities}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div>Aangemeld: {formatDate(aanmelding.created_at)}</div>
                    <div>Bijgewerkt: {formatDate(aanmelding.updated_at)}</div>
                    {aanmelding.behandeld_door && (
                      <div>Behandeld door: {aanmelding.behandeld_door}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 pb-4">
              <select
                value={aanmelding.status}
                onChange={(e) => handleStatusChange(aanmelding.id, e.target.value as Aanmelding['status'])}
                className="block w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="nieuw">Nieuw</option>
                <option value="in_behandeling">In behandeling</option>
                <option value="behandeld">Behandeld</option>
                <option value="geannuleerd">Geannuleerd</option>
              </select>
            </div>
          </div>
        ))
      )}
    </div>
  )

  // Tablet View (Condensed Table)
  const TabletView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Naam</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rol</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Afstand</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email verzonden</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acties</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {aanmeldingen.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Geen aanmeldingen gevonden
              </td>
            </tr>
          ) : (
            aanmeldingen.map((aanmelding) => (
              <tr key={aanmelding.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {aanmelding.naam}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {aanmelding.email}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <StatusBadge status={aanmelding.status} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {aanmelding.rol}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {aanmelding.afstand}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <span className={aanmelding.email_verzonden ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {aanmelding.email_verzonden ? 'Ja' : 'Nee'}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <select
                    value={aanmelding.status}
                    onChange={(e) => handleStatusChange(aanmelding.id, e.target.value as Aanmelding['status'])}
                    className="block w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="nieuw">Nieuw</option>
                    <option value="in_behandeling">In behandeling</option>
                    <option value="behandeld">Behandeld</option>
                    <option value="geannuleerd">Geannuleerd</option>
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )

  // Desktop View (Full Table)
  const DesktopView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Naam</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Telefoon</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rol</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Afstand</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ondersteuning</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bijzonderheden</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Terms</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email Verzonden</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Behandeld Door</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notities</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created At</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Updated At</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acties</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {aanmeldingen.length === 0 ? (
            <tr>
              <td colSpan={15} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Geen aanmeldingen gevonden
              </td>
            </tr>
          ) : (
            aanmeldingen.map((aanmelding) => (
              <tr key={aanmelding.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {aanmelding.naam}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {aanmelding.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {aanmelding.telefoon || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={aanmelding.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {aanmelding.rol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {aanmelding.afstand}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {aanmelding.ondersteuning}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title={aanmelding.bijzonderheden || undefined}>
                  {aanmelding.bijzonderheden || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {aanmelding.terms ? 'Ja' : 'Nee'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {aanmelding.email_verzonden ? 'Ja' : 'Nee'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {aanmelding.behandeld_door || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate" title={aanmelding.notities || undefined}>
                  {aanmelding.notities || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(aanmelding.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(aanmelding.updated_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <select
                    value={aanmelding.status}
                    onChange={(e) => handleStatusChange(aanmelding.id, e.target.value as Aanmelding['status'])}
                    className="block w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="nieuw">Nieuw</option>
                    <option value="in_behandeling">In behandeling</option>
                    <option value="behandeld">Behandeld</option>
                    <option value="geannuleerd">Geannuleerd</option>
                  </select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(stats.rollen).map(([rol, aantal]) => (
          <div key={rol} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 shadow-sm">
            <dt className="text-xs text-gray-500 dark:text-gray-400">{rol}</dt>
            <dd className="mt-1 text-xl font-medium text-gray-900 dark:text-white">{String(aantal)}</dd>
          </div>
        ))}
      </div>

      {/* Aanmeldingen Container */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aanmeldingen</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Totaal: {aanmeldingen.length} aanmeldingen
          </p>
        </div>

        <div className="p-6">
          {screenSize === 'mobile' && <MobileView />}
          {screenSize === 'tablet' && <TabletView />}
          {screenSize === 'desktop' && <DesktopView />}
        </div>
      </div>
    </div>
  )
}