import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { updateAanmelding } from '../services/aanmeldingenService'
import type { DashboardContext } from '../../../types/dashboard'
import type { Aanmelding } from '../types'
import { usePermissions } from '../../../hooks/usePermissions'
import { RegistrationItem } from './RegistrationItem'
import { cc } from '../../../styles/shared'

export function AanmeldingenTab() {
  const { stats, aanmeldingen, handleUpdate } = useOutletContext<DashboardContext>()
  const { hasPermission } = usePermissions()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | Aanmelding['status']>('all')
  const [filterRole, setFilterRole] = useState<'all' | Aanmelding['rol']>('all')

  const canReadAanmeldingen = hasPermission('aanmelding', 'read')
  const canWriteAanmeldingen = hasPermission('aanmelding', 'write')

  // Filter aanmeldingen
  const filteredAanmeldingen = aanmeldingen.filter(aanmelding => {
    const matchesSearch = 
      aanmelding.naam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aanmelding.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aanmelding.telefoon?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || aanmelding.status === filterStatus;
    const matchesRole = filterRole === 'all' || aanmelding.rol === filterRole;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Calculate additional stats
  const statusStats = {
    nieuw: aanmeldingen.filter(a => a.status === 'nieuw').length,
    in_behandeling: aanmeldingen.filter(a => a.status === 'in_behandeling').length,
    behandeld: aanmeldingen.filter(a => a.status === 'behandeld').length,
    geannuleerd: aanmeldingen.filter(a => a.status === 'geannuleerd').length,
  };

  if (!canReadAanmeldingen) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md w-full text-center border border-gray-200 dark:border-gray-700">
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Geen Toegang</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Je hebt geen toestemming om aanmeldingen te bekijken.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Role Statistics */}
      <div className={`${cc.grid.twoThree()} gap-4`}>
        {Object.entries(stats.rollen).map(([rol, aantal]) => (
          <div key={rol} className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm ${cc.hover.card}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{rol}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{String(aantal)}</p>
              </div>
              <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-lg p-2">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Statistics */}
      <div className={`${cc.grid.twoFour()} gap-4`}>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">Nieuw</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusStats.nieuw}</p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/50 rounded-lg p-2">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">In behandeling</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusStats.in_behandeling}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-2">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">Behandeld</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusStats.behandeld}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/50 rounded-lg p-2">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Geannuleerd</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{statusStats.geannuleerd}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/50 rounded-lg p-2">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Aanmeldingen Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Aanmeldingen</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {filteredAanmeldingen.length} {filteredAanmeldingen.length === 1 ? 'aanmelding' : 'aanmeldingen'}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Zoek aanmeldingen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className={cc.form.select({ className: 'text-sm' })}
              >
                <option value="all">Alle Rollen</option>
                <option value="Deelnemer">Deelnemer</option>
                <option value="Begeleider">Begeleider</option>
                <option value="Vrijwilliger">Vrijwilliger</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className={cc.form.select({ className: 'text-sm' })}
              >
                <option value="all">Alle Status</option>
                <option value="nieuw">Nieuw</option>
                <option value="in_behandeling">In behandeling</option>
                <option value="behandeld">Behandeld</option>
                <option value="geannuleerd">Geannuleerd</option>
              </select>
            </div>
          </div>
        </div>

        {/* Aanmeldingen List */}
        <div className="p-6">
          {filteredAanmeldingen.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Geen aanmeldingen gevonden</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                {searchQuery || filterStatus !== 'all' || filterRole !== 'all'
                  ? 'Probeer een andere zoekopdracht of filter'
                  : 'Er zijn nog geen aanmeldingen ontvangen'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAanmeldingen.map((aanmelding) => (
                <RegistrationItem
                  key={aanmelding.id}
                  registration={aanmelding}
                  onStatusUpdate={handleUpdate}
                  canWrite={canWriteAanmeldingen}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}