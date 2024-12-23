import { useState } from 'react'
import { ErrorText } from '../../../components/typography'
import type { AlbumWithDetails } from '../types'
import { supabase } from '../../../lib/supabase'
import { isAdmin } from '../../../lib/supabase'
import { useAuth } from '../../../contexts/AuthContext'

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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {album ? 'Album bewerken' : 'Nieuw album'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <span className="sr-only">Sluiten</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Titel */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Titel *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Beschrijving */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Beschrijving
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          {/* Zichtbaarheid */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="visible"
              checked={formData.visible}
              onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="visible" className="text-sm text-gray-700">
              Zichtbaar op website
            </label>
          </div>

          {error && <ErrorText>{error}</ErrorText>}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Bezig met opslaan...' : album ? 'Opslaan' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 