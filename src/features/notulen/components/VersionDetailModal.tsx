import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import {
  XMarkIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { userClient } from '@/api/client'
import { cc } from '@/styles/shared'
import type { NotulenVersion, AgendaItem, Besluit, Actiepunt } from '../types'

interface VersionDetailModalProps {
  version: NotulenVersion | null
  isOpen: boolean
  onClose: () => void
}

export function VersionDetailModal({ version, isOpen, onClose }: VersionDetailModalProps) {
  const [userName, setUserName] = useState<string>('')

  // Resolve user UUID to name
  useEffect(() => {
    const resolveUserName = async () => {
      if (!version?.gewijzigd_door) return
      
      try {
        const user = await userClient.getUserById(version.gewijzigd_door)
        setUserName(user.naam)
      } catch (error) {
        console.error('Failed to resolve user name:', error)
        setUserName(version.gewijzigd_door) // Fallback to UUID
      }
    }

    if (isOpen && version) {
      resolveUserName()
    }
  }, [version, isOpen])

  if (!isOpen || !version) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'finalized': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Concept'
      case 'finalized': return 'Definitief'
      case 'archived': return 'Gearchiveerd'
      default: return status
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {version.titel}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Versie {version.versie} • {format(new Date(version.vergadering_datum), 'PPP', { locale: nl })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(version.status)}`}>
              {getStatusText(version.status)}
            </span>
            <button
              onClick={onClose}
              className={cc.button.icon({ color: 'secondary' })}
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-6">
          {/* Version Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Gewijzigd door:</span>
                <span className="font-medium text-gray-900 dark:text-white">{userName || version.gewijzigd_door}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">Gewijzigd op:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {format(new Date(version.gewijzigd_op), 'PPp', { locale: nl })}
                </span>
              </div>
            </div>
            {version.wijziging_reden && (
              <div className="mt-3 p-3 bg-white dark:bg-gray-600 rounded text-sm">
                <strong className="text-gray-700 dark:text-gray-300">Wijzigingsreden:</strong>
                <p className="mt-1 text-gray-900 dark:text-white">{version.wijziging_reden}</p>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Titel</span>
                <p className="text-gray-900 dark:text-white font-medium">{version.titel}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Datum</span>
                <p className="text-gray-900 dark:text-white">{format(new Date(version.vergadering_datum), 'PPP', { locale: nl })}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Locatie</span>
                <p className="text-gray-900 dark:text-white">{version.locatie || 'Niet opgegeven'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Voorzitter</span>
                <p className="text-gray-900 dark:text-white">{version.voorzitter || 'Niet opgegeven'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Notulist</span>
                <p className="text-gray-900 dark:text-white">{version.notulist || 'Niet opgegeven'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Versie</span>
                <p className="text-gray-900 dark:text-white">{version.versie}</p>
              </div>
            </div>
          </div>

          {/* Attendees */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <UserGroupIcon className="w-5 h-5" />
              Aanwezigen en Afwezigen
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Aanwezigen ({version.aanwezigen?.length || 0})
                </h4>
                {version.aanwezigen && version.aanwezigen.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {version.aanwezigen.map((name, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">Geen aanwezigen opgegeven</p>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Afwezigen ({version.afwezigen?.length || 0})
                </h4>
                {version.afwezigen && version.afwezigen.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {version.afwezigen.map((name, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">Geen afwezigen opgegeven</p>
                )}
              </div>
            </div>
          </div>

          {/* Agenda Items */}
          {version.agenda_items && version.agenda_items.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Agenda Items
              </h3>

              <div className="space-y-4">
                {version.agenda_items.map((item: AgendaItem, index: number) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">{item.title}</h4>
                        {item.details && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm">{item.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Besluiten */}
          {version.besluiten && version.besluiten.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5" />
                Besluiten
              </h3>

              <div className="space-y-4">
                {version.besluiten.map((besluit: Besluit, index: number) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white">{besluit.besluit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actiepunten */}
          {version.actiepunten && version.actiepunten.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5" />
                Actiepunten
              </h3>

              <div className="space-y-4">
                {version.actiepunten.map((actie: Actiepunt, index: number) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 flex items-center">
                        <input
                          type="checkbox"
                          checked={actie.voltooid || false}
                          disabled
                          className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium mb-1 ${
                          actie.voltooid
                            ? 'text-gray-600 dark:text-gray-400 line-through'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {actie.actie}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-4 h-4" />
                            {Array.isArray(actie.verantwoordelijke) ? actie.verantwoordelijke.join(', ') : actie.verantwoordelijke}
                          </span>
                          {actie.voltooid && actie.voltooid_op && (
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <CheckCircleIcon className="w-4 h-4" />
                              Voltooid op {format(new Date(actie.voltooid_op), 'PP', { locale: nl })}
                              {actie.voltooid_door && ` door ${actie.voltooid_door}`}
                            </span>
                          )}
                        </div>
                        {actie.voltooid && actie.voltooid_opmerking && (
                          <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded text-sm text-green-800 dark:text-green-200">
                            <strong>Opmerking:</strong> {actie.voltooid_opmerking}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notities */}
          {version.notities && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Notities
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{version.notities}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
