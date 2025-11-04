import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import {
  ArrowLeftIcon,
  PencilIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { useNotulenById, useNotulenMutations, useNotulenVersions } from '../hooks'
import { usePermissions } from '@/hooks'
import { cc } from '@/styles/shared'
import type { AgendaItem, Besluit, Actiepunt } from '../types'

export function NotulenDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const { notulen, loading, error, refetch } = useNotulenById(id)
  const { finalizeNotulen, archiveNotulen, loading: actionLoading } = useNotulenMutations()
  const { versions } = useNotulenVersions(id)

  const [showVersions, setShowVersions] = useState(false)
  const [finalizationReason, setFinalizationReason] = useState('')
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false)

  const handleFinalize = async () => {
    if (!notulen || !id) return

    try {
      await finalizeNotulen(id, finalizationReason || undefined)
      setShowFinalizeDialog(false)
      setFinalizationReason('')
      refetch()
    } catch (err) {
      console.error('Failed to finalize notulen:', err)
    }
  }

  const handleArchive = async () => {
    if (!notulen || !id) return

    try {
      await archiveNotulen(id)
      refetch()
    } catch (err) {
      console.error('Failed to archive notulen:', err)
    }
  }

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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !notulen) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Notulen niet gevonden
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error || 'De gevraagde notulen konden niet worden gevonden.'}
        </p>
        <Link
          to="/notulen"
          className={cc.button.base({ color: 'primary' })}
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Terug naar overzicht
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/notulen')}
            className={cc.button.icon({ color: 'secondary' })}
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {notulen.titel}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Vergadering van {format(new Date(notulen.vergadering_datum), 'PPP', { locale: nl })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(notulen.status)}`}>
            {getStatusText(notulen.status)}
          </span>

          <div className="flex gap-2">
            {hasPermission('notulen', 'write') && notulen.status === 'draft' && (
              <Link
                to={`/notulen/${notulen.id}/bewerken`}
                className={cc.button.base({ color: 'primary', size: 'sm' })}
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Bewerken
              </Link>
            )}

            {hasPermission('notulen', 'write') && notulen.status === 'draft' && (
              <button
                onClick={() => setShowFinalizeDialog(true)}
                disabled={actionLoading}
                className={cc.button.base({ color: 'success', size: 'sm' })}
              >
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Definitief maken
              </button>
            )}

            {hasPermission('notulen', 'write') && notulen.status === 'finalized' && (
              <button
                onClick={handleArchive}
                disabled={actionLoading}
                className={cc.button.base({ color: 'secondary', size: 'sm' })}
              >
                <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                Archiveren
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <DocumentTextIcon className="w-5 h-5" />
          Vergaderinformatie
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Titel</span>
              <p className="text-gray-900 dark:text-white font-medium">{notulen.titel}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Datum</span>
              <p className="text-gray-900 dark:text-white">{format(new Date(notulen.vergadering_datum), 'PPP', { locale: nl })}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Locatie</span>
              <p className="text-gray-900 dark:text-white">{notulen.locatie || 'Niet opgegeven'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Voorzitter</span>
              <p className="text-gray-900 dark:text-white">{notulen.voorzitter || 'Niet opgegeven'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Notulist</span>
              <p className="text-gray-900 dark:text-white">{notulen.notulist || 'Niet opgegeven'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Versie</span>
              <p className="text-gray-900 dark:text-white">{notulen.versie}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendees */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <UserGroupIcon className="w-5 h-5" />
          Aanwezigen en Afwezigen
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Aanwezigen ({notulen.aanwezigen.length})</h3>
            {notulen.aanwezigen.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {notulen.aanwezigen.map((name, index) => (
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
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Afwezigen ({notulen.afwezigen.length})</h3>
            {notulen.afwezigen.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {notulen.afwezigen.map((name, index) => (
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
      {notulen.agendaItems.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5" />
            Agenda Items
          </h2>

          <div className="space-y-4">
            {notulen.agendaItems.map((item: AgendaItem, index: number) => (
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
      {notulen.besluitenList.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            Besluiten
          </h2>

          <div className="space-y-4">
            {notulen.besluitenList.map((besluit: Besluit, index: number) => (
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
      {notulen.actiepuntenList.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            Actiepunten ({notulen.actiepuntenList.filter(a => a.voltooid).length}/{notulen.actiepuntenList.length} voltooid)
          </h2>

          <div className="space-y-4">
            {notulen.actiepuntenList.map((actie: Actiepunt, index: number) => (
              <div key={index} className={`border rounded-lg p-4 transition-all ${
                actie.voltooid
                  ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 flex items-center">
                    <input
                      type="checkbox"
                      checked={actie.voltooid || false}
                      onChange={() => {/* TODO: Implement completion toggle */}}
                      disabled={!hasPermission('notulen', 'write') || notulen.status === 'archived'}
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
                        <UserGroupIcon className="w-4 h-4" />
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
      {notulen.notities && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5" />
            Notities
          </h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{notulen.notities}</p>
          </div>
        </div>
      )}

      {/* Version History */}
      {versions.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <button
            onClick={() => setShowVersions(!showVersions)}
            className="w-full flex items-center justify-between text-lg font-semibold text-gray-900 dark:text-white mb-4"
          >
            <span className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              Versiegeschiedenis ({versions.length} versies)
            </span>
            {showVersions ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
          </button>

          {showVersions && (
            <div className="space-y-3">
              {versions.map((version) => (
                <div key={version.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(version.status)}`}>
                      {getStatusText(version.status)}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Versie {version.versie}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(version.gewijzigd_op), 'PPp', { locale: nl })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {version.gewijzigd_door}
                    </span>
                    <button className={cc.button.icon({ color: 'secondary', size: 'sm' })}>
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Finalize Dialog */}
      {showFinalizeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Notulen definitief maken
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Weet u zeker dat u deze notulen definitief wilt maken? Na finalisatie kunnen ze niet meer worden bewerkt.
            </p>

            <div className="mb-4">
              <label className={cc.form.label()}>
                Reden voor finalisatie (optioneel)
              </label>
              <textarea
                value={finalizationReason}
                onChange={(e) => setFinalizationReason(e.target.value)}
                className={cc.form.textarea()}
                placeholder="Beschrijf waarom deze versie definitief wordt gemaakt..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowFinalizeDialog(false)}
                className={cc.button.base({ color: 'secondary' })}
              >
                Annuleren
              </button>
              <button
                onClick={handleFinalize}
                disabled={actionLoading}
                className={cc.button.base({ color: 'success' })}
              >
                {actionLoading ? 'Bezig...' : 'Definitief maken'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
