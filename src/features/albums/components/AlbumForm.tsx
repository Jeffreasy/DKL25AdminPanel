import { useState } from 'react'
import type { AlbumWithDetails } from '../types'
import { supabase } from '../../../lib/supabase'
import { isAdmin } from '../../../lib/supabase'
import { useAuth } from '../../../contexts/AuthContext'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Z_INDEX } from '../../../constants/zIndex'

interface AlbumFormProps {
  album?: AlbumWithDetails
  onComplete: () => void
  onCancel: () => void
}

export function AlbumForm({ album, onComplete, onCancel }: AlbumFormProps) {
  const { isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    title: album?.title || '',
    description: album?.description || '',
    visible: album?.visible ?? true,
    order_number: album?.order_number || 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getLastOrderNumber = async (): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('order_number')
        .order('order_number', { ascending: false })
        .limit(1)
        .maybeSingle<{ order_number: number }>()

      if (error) throw error

      if (!data) return 1

      return (data.order_number || 0) + 1
    } catch (err) {
      console.error('Error getting last order number:', err)
      return 1
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !isAuthenticated) return

    try {
      setIsSubmitting(true)
      setError(null)

      const isAdminUser = await isAdmin()
      if (!isAdminUser) {
        throw new Error('Je hebt geen rechten om albums te beheren')
      }

      if (album?.id) {
        // Update bestaand album
        const { error } = await supabase
          .from('albums')
          .update({
            title: formData.title,
            description: formData.description,
            visible: formData.visible,
            order_number: formData.order_number,
            updated_at: new Date().toISOString()
          })
          .eq('id', album.id)

        if (error) throw error
      } else {
        // Get last order number
        const nextOrderNumber = await getLastOrderNumber()

        // Nieuw album
        const { error } = await supabase
          .from('albums')
          .insert([{
            title: formData.title,
            description: formData.description,
            visible: formData.visible,
            order_number: nextOrderNumber,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (error) throw error
      }

      onComplete()
    } catch (err) {
      console.error('Error saving album:', err)
      setError(err instanceof Error ? err.message : 'Er ging iets mis bij het opslaan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`fixed inset-0 bg-black/30 z-[${Z_INDEX.ALBUM_FORM}]`}>
      <div className={`fixed inset-0 flex items-center justify-center p-4 z-[${Z_INDEX.ALBUM_FORM}]`}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {album ? 'Album bewerken' : 'Nieuw album'}
            </h2>
            <button 
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-5">
              {/* Titel */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Titel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              {/* Beschrijving */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Beschrijving
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optionele beschrijving van het album..."
                />
              </div>

              {/* Zichtbaarheid */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="visible"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={formData.visible}
                  onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
                />
                <label htmlFor="visible" className="ml-2 block text-sm text-gray-700">
                  Zichtbaar op website
                </label>
              </div>

              {/* Error message */}
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Bezig met opslaan...' : album ? 'Opslaan' : 'Toevoegen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 