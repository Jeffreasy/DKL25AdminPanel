import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import {
  ClockIcon,
  EyeIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useNotulenVersions } from '../hooks'
import { usePermissions } from '@/hooks'
import { userClient } from '@/api/client'
import { cc } from '@/styles/shared'
import type { NotulenVersion } from '../types'

interface VersionHistoryProps {
  notulenId: string
  currentVersion: number
  onViewVersion?: (version: NotulenVersion) => void
  onRollback?: (version: NotulenVersion) => void
}

export function VersionHistory({ notulenId, currentVersion, onViewVersion, onRollback }: VersionHistoryProps) {
  const { hasPermission } = usePermissions()
  const { versions, loading, error, refetch } = useNotulenVersions(notulenId)
  const [expanded, setExpanded] = useState(false)
  const [rollbackLoading, setRollbackLoading] = useState<string | null>(null)
  const [userNames, setUserNames] = useState<Record<string, string>>({})

  // Resolve user UUIDs to names
  useEffect(() => {
    const resolveUserNames = async () => {
      const uniqueUserIds = new Set<string>()
      versions.forEach(v => {
        if (v.gewijzigd_door) uniqueUserIds.add(v.gewijzigd_door)
      })

      const names: Record<string, string> = {}
      for (const userId of uniqueUserIds) {
        try {
          const user = await userClient.getUserById(userId)
          names[userId] = user.naam
        } catch (error) {
          console.error(`Failed to resolve user ${userId}:`, error)
          names[userId] = userId // Fallback to UUID
        }
      }

      setUserNames(names)
    }

    if (versions.length > 0) {
      resolveUserNames()
    }
  }, [versions])

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

  const handleRollback = async (version: NotulenVersion) => {
    if (!onRollback) return

    setRollbackLoading(version.id)
    try {
      await onRollback(version)
    } finally {
      setRollbackLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>Fout bij laden versiegeschiedenis: {error}</span>
          <button
            onClick={refetch}
            className={cc.button.icon({ color: 'secondary', size: 'sm' })}
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  if (versions.length <= 1) {
    return null // Don't show if there's only the current version
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-6 text-lg font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <span className="flex items-center gap-2">
          <ClockIcon className="w-5 h-5" />
          Versiegeschiedenis ({versions.length} versies)
        </span>
        {expanded ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronRightIcon className="w-5 h-5" />}
      </button>

      {expanded && (
        <div className="px-6 pb-6">
          <div className="space-y-4">
            {versions.map((version) => {
              const isCurrentVersion = version.versie === currentVersion
              const canRollback = hasPermission('notulen', 'write') && !isCurrentVersion

              return (
                <div
                  key={version.id}
                  className={`border rounded-lg p-4 transition-all ${
                    isCurrentVersion
                      ? 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(version.status)}`}>
                          {getStatusText(version.status)}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Versie {version.versie}
                          {isCurrentVersion && (
                            <span className="ml-2 text-blue-600 dark:text-blue-400 font-normal">
                              (huidig)
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4" />
                          <span>{userNames[version.gewijzigd_door] || version.gewijzigd_door}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4" />
                          <span>{format(new Date(version.gewijzigd_op), 'PPp', { locale: nl })}</span>
                        </div>
                      </div>

                      {version.wijziging_reden && (
                        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                          <strong>Reden:</strong> {version.wijziging_reden}
                        </div>
                      )}

                      {/* Version summary */}
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <UserIcon className="w-3 h-3" />
                          <span>{version.aanwezigen?.length || 0} aanwezigen</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DocumentTextIcon className="w-3 h-3" />
                          <span>{version.agenda_items?.length || 0} agenda items</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DocumentTextIcon className="w-3 h-3" />
                          <span>{version.besluiten?.length || 0} besluiten</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DocumentTextIcon className="w-3 h-3" />
                          <span>{version.actiepunten?.length || 0} actiepunten</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => onViewVersion?.(version)}
                        className={cc.button.icon({ color: 'secondary', size: 'sm' })}
                        title="Bekijk versie"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>

                      {canRollback && (
                        <button
                          onClick={() => handleRollback(version)}
                          disabled={rollbackLoading === version.id}
                          className={cc.button.icon({ color: 'primary', size: 'sm' })}
                          title="Terugrollen naar deze versie"
                        >
                          {rollbackLoading === version.id ? (
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          ) : (
                            <ArrowUturnLeftIcon className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
