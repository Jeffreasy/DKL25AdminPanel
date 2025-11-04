import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import {
  DocumentTextIcon,
  PencilIcon,
  EyeIcon,
  ArchiveBoxIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { useNotulen, useNotulenSearch } from '../hooks'
import { usePermissions } from '@/hooks'
import { cc } from '@/styles/shared'
import type { NotulenFilters } from '../types'

export function NotulenList() {
  const [filters, setFilters] = useState<NotulenFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const { notulen, loading, error, refetch } = useNotulen(filters)
  const { search, results, loading: searchLoading } = useNotulenSearch()
  const { hasPermission } = usePermissions()

  const displayNotulen = searchQuery ? results : notulen
  const isLoading = searchQuery ? searchLoading : loading

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      await search({ q: query, ...filters })
    } else {
      refetch()
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

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={refetch}
          className={cc.button.base({ color: 'primary' })}
        >
          Opnieuw proberen
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notulen
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Beheer vergadernotulen en documenten
          </p>
        </div>
        {hasPermission('notulen', 'write') && (
          <Link
            to="/notulen/nieuw"
            className={cc.button.base({ color: 'primary' })}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nieuwe Notulen
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Zoek notulen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                className={cc.form.input()}
              />
            </div>
          </div>
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              status: (e.target.value as 'draft' | 'finalized' | 'archived' | '') || undefined
            }))}
            className={cc.form.select()}
          >
            <option value="">Alle statussen</option>
            <option value="draft">Concept</option>
            <option value="finalized">Definitief</option>
            <option value="archived">Gearchiveerd</option>
          </select>
        </div>
      </div>

      {/* Notulen List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : displayNotulen.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Geen notulen gevonden
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? 'Probeer een andere zoekterm' : 'Maak je eerste notulen aan'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayNotulen.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {item.titel}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>
                      <strong>Datum:</strong> {format(new Date(item.vergadering_datum), 'PPP', { locale: nl })}
                    </p>
                    {item.locatie && (
                      <p><strong>Locatie:</strong> {item.locatie}</p>
                    )}
                    {item.voorzitter && (
                      <p><strong>Voorzitter:</strong> {item.voorzitter}</p>
                    )}
                    <p><strong>Versie:</strong> {item.versie}</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link
                    to={`/notulen/${item.id}`}
                    className={cc.button.icon({ color: 'secondary' })}
                    title="Bekijken"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </Link>
                  {hasPermission('notulen', 'write') && item.status === 'draft' && (
                    <Link
                      to={`/notulen/${item.id}/bewerken`}
                      className={cc.button.icon({ color: 'primary' })}
                      title="Bewerken"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </Link>
                  )}
                  {hasPermission('notulen', 'archive') && item.status === 'finalized' && (
                    <button
                      className={cc.button.icon({ color: 'secondary' })}
                      title="Archiveren"
                    >
                      <ArchiveBoxIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
