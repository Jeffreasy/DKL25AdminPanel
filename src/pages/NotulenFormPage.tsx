import React from 'react'
import { useParams } from 'react-router-dom'
import { NotulenForm } from '@/features/notulen'
import { useNotulenById } from '@/features/notulen/hooks'
import { usePageTitle } from '@/hooks'

export function NotulenFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

  usePageTitle(isEditing ? 'Notulen Bewerken' : 'Nieuwe Notulen')

  // Load existing notulen data when editing
  const { notulen, loading, error } = useNotulenById(id)

  if (isEditing && loading) {
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

  if (isEditing && error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="text-red-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Notulen niet gevonden
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error || 'De gevraagde notulen konden niet worden gevonden.'}
        </p>
        <a
          href="/notulen"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Terug naar overzicht
        </a>
      </div>
    )
  }

  return <NotulenForm notulen={isEditing && notulen ? notulen : undefined} />
}
