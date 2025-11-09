import React, { useState } from 'react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import {
  XMarkIcon,
  ArrowRightIcon,
  MinusIcon,
  PlusIcon,
  EyeIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { cc } from '@/styles/shared'
import type { NotulenVersion, AgendaItem, Besluit, Actiepunt } from '../types'

interface VersionComparisonProps {
  version1: NotulenVersion
  version2: NotulenVersion
  isOpen: boolean
  onClose: () => void
}

type DiffType = 'added' | 'removed' | 'modified' | 'unchanged'

interface DiffItem<T> {
  type: DiffType
  value: T
  oldValue?: T
}

export function VersionComparison({ version1, version2, isOpen, onClose }: VersionComparisonProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'agenda' | 'besluiten' | 'actiepunten' | 'notities'>('overview')

  if (!isOpen || !version1 || !version2) return null

  // Helper function to compare arrays and find differences
  const compareArrays = <T,>(
    arr1: T[],
    arr2: T[],
    compareFn: (a: T, b: T) => boolean = (a, b) => a === b
  ): DiffItem<T>[] => {
    const result: DiffItem<T>[] = []
    const usedIndices = new Set<number>()

    // Find items in arr1 that are in arr2 (unchanged or modified)
    arr1.forEach((item1) => {
      const matchIndex = arr2.findIndex((item2, index2) =>
        !usedIndices.has(index2) && compareFn(item1, item2)
      )

      if (matchIndex !== -1) {
        usedIndices.add(matchIndex)
        result.push({ type: 'unchanged', value: item1 })
      } else {
        result.push({ type: 'removed', value: item1 })
      }
    })

    // Find items in arr2 that are not in arr1 (added)
    arr2.forEach((item2, index2) => {
      if (!usedIndices.has(index2)) {
        result.push({ type: 'added', value: item2 })
      }
    })

    return result
  }

  // Compare simple strings
  const compareStrings = (str1: string, str2: string): DiffItem<string> => {
    if (str1 === str2) {
      return { type: 'unchanged', value: str1 }
    } else {
      return { type: 'modified', value: str2, oldValue: str1 }
    }
  }

  // Compare agenda items
  const compareAgendaItems = (): DiffItem<AgendaItem>[] => {
    const items1 = version1.agenda_items || []
    const items2 = version2.agenda_items || []
    return compareArrays(items1, items2, (a, b) => a.title === b.title && a.details === b.details)
  }

  // Compare besluiten
  const compareBesluiten = (): DiffItem<Besluit>[] => {
    const items1 = version1.besluiten || []
    const items2 = version2.besluiten || []
    return compareArrays(items1, items2, (a, b) => a.besluit === b.besluit)
  }

  // Compare actiepunten
  const compareActiepunten = (): DiffItem<Actiepunt>[] => {
    const items1 = version1.actiepunten || []
    const items2 = version2.actiepunten || []
    return compareArrays(items1, items2, (a, b) => a.actie === b.actie)
  }

  const getDiffIcon = (type: DiffType) => {
    switch (type) {
      case 'added': return <PlusIcon className="w-4 h-4 text-green-600" />
      case 'removed': return <MinusIcon className="w-4 h-4 text-red-600" />
      case 'modified': return <ArrowRightIcon className="w-4 h-4 text-blue-600" />
      default: return null
    }
  }

  const getDiffColor = (type: DiffType) => {
    switch (type) {
      case 'added': return 'border-l-green-500 bg-green-50 dark:bg-green-900/20'
      case 'removed': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20'
      case 'modified': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
      default: return ''
    }
  }

  const renderDiffItem = <T,>(
    item: DiffItem<T>,
    renderContent: (value: T, oldValue?: T) => React.ReactNode,
    key: string | number
  ) => (
    <div
      key={key}
      className={`border-l-4 p-3 rounded-r ${getDiffColor(item.type)}`}
    >
      <div className="flex items-start gap-2">
        {getDiffIcon(item.type)}
        <div className="flex-1">
          {renderContent(item.value, item.oldValue)}
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview', label: 'Overzicht', icon: EyeIcon },
    { id: 'agenda', label: 'Agenda', icon: DocumentTextIcon },
    { id: 'besluiten', label: 'Besluiten', icon: CheckCircleIcon },
    { id: 'actiepunten', label: 'Actiepunten', icon: CheckCircleIcon },
    { id: 'notities', label: 'Notities', icon: DocumentTextIcon }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Versie Vergelijking
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span className="font-medium">Versie {version1.versie}</span>
                <ArrowRightIcon className="w-4 h-4" />
                <span className="font-medium">Versie {version2.versie}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className={cc.button.icon({ color: 'secondary' })}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Basic info comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                    Versie {version1.versie} ({format(new Date(version1.gewijzigd_op), 'PPp', { locale: nl })})
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Titel:</strong> {version1.titel}</div>
                    <div><strong>Status:</strong> {version1.status}</div>
                    <div><strong>Aanwezigen:</strong> {version1.aanwezigen?.length || 0}</div>
                    <div><strong>Agenda items:</strong> {version1.agenda_items?.length || 0}</div>
                    <div><strong>Besluiten:</strong> {version1.besluiten?.length || 0}</div>
                    <div><strong>Actiepunten:</strong> {version1.actiepunten?.length || 0}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                    Versie {version2.versie} ({format(new Date(version2.gewijzigd_op), 'PPp', { locale: nl })})
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Titel:</strong> {version2.titel}</div>
                    <div><strong>Status:</strong> {version2.status}</div>
                    <div><strong>Aanwezigen:</strong> {version2.aanwezigen?.length || 0}</div>
                    <div><strong>Agenda items:</strong> {version2.agenda_items?.length || 0}</div>
                    <div><strong>Besluiten:</strong> {version2.besluiten?.length || 0}</div>
                    <div><strong>Actiepunten:</strong> {version2.actiepunten?.length || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agenda' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Agenda Items</h3>
              {compareAgendaItems().map((diff, index) =>
                renderDiffItem(
                  diff,
                  (item: AgendaItem) => (
                    <div>
                      <div className="font-medium">{item.title}</div>
                      {item.details && <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.details}</div>}
                    </div>
                  ),
                  index
                )
              )}
            </div>
          )}

          {activeTab === 'besluiten' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Besluiten</h3>
              {compareBesluiten().map((diff, index) =>
                renderDiffItem(
                  diff,
                  (item: Besluit) => (
                    <div className="text-gray-900 dark:text-white">{item.besluit}</div>
                  ),
                  index
                )
              )}
            </div>
          )}

          {activeTab === 'actiepunten' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Actiepunten</h3>
              {compareActiepunten().map((diff, index) =>
                renderDiffItem(
                  diff,
                  (item: Actiepunt) => (
                    <div>
                      <div className={`font-medium ${item.voltooid ? 'line-through text-gray-500' : ''}`}>
                        {item.actie}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Verantwoordelijke: {Array.isArray(item.verantwoordelijke) ? item.verantwoordelijke.join(', ') : item.verantwoordelijke}
                        {item.voltooid && item.voltooid_op && (
                          <span className="ml-2 text-green-600">
                            • Voltooid op {format(new Date(item.voltooid_op), 'PP', { locale: nl })}
                          </span>
                        )}
                      </div>
                    </div>
                  ),
                  index
                )
              )}
            </div>
          )}

          {activeTab === 'notities' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notities</h3>
              {renderDiffItem(
                compareStrings(version1.notities || '', version2.notities || ''),
                (value: string, oldValue?: string) => (
                  <div className="space-y-3">
                    {oldValue && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded">
                        <div className="text-sm text-red-800 dark:text-red-200 mb-1">Oude versie:</div>
                        <div className="text-gray-900 dark:text-white whitespace-pre-wrap">{oldValue}</div>
                      </div>
                    )}
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded">
                      <div className="text-sm text-green-800 dark:text-green-200 mb-1">Nieuwe versie:</div>
                      <div className="text-gray-900 dark:text-white whitespace-pre-wrap">{value}</div>
                    </div>
                  </div>
                ),
                'notities'
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
