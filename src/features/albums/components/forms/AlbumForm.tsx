import { useState } from 'react'
import { supabase } from '../../../../lib/supabase'
import type { AlbumWithDetails } from '../../types'
import { useAuth } from '../../../../contexts/auth/useAuth'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Z_INDEX } from '../../../../constants/zIndex'
import { cc } from '../../../../styles/shared'

interface AlbumFormProps {
  album?: AlbumWithDetails
  onComplete: () => void
  onCancel: () => void
}

export function AlbumForm({ album, onComplete, onCancel }: AlbumFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: album?.title || '',
    description: album?.description || '',
    visible: album?.visible ?? true,
    order_number: album?.order_number || 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) {
    return <div>Authenticatie vereist.</div>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !formData.title) {
      setError('Titel is verplicht')
      return
    }
    setError(null)
    setIsSubmitting(true)

    try {
      const upsertData = {
        title: formData.title,
        description: formData.description || null,
        visible: formData.visible,
        order_number: Number(formData.order_number) || 1,
        user_id: user.id,
        updated_at: new Date().toISOString()
      }

      if (album?.id) {
        const { error: updateError } = await supabase
          .from('albums')
          .update(upsertData)
          .eq('id', album.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('albums')
          .insert([{ ...upsertData, user_id: user.id }])

        if (insertError) throw insertError
      }

      onComplete()
    } catch (err) {
      console.error('Error saving album:', err)
      setError(err instanceof Error ? err.message : 'Opslaan mislukt')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`fixed inset-0 bg-black/50 z-[${Z_INDEX.ALBUM_FORM}] flex items-center justify-center p-4`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {album ? 'Album bewerken' : 'Nieuw album aanmaken'}
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Titel <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Beschrijving
              </label>
              <textarea
                id="description"
                rows={3}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optionele beschrijving van het album..."
              />
            </div>

            <div>
              <label htmlFor="order_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Volgorde
              </label>
              <input
                type="number"
                id="order_number"
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.order_number}
                onChange={(e) => setFormData(prev => ({ ...prev, order_number: parseInt(e.target.value) || 0 }))}
                min="1"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="visible"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-700"
                checked={formData.visible}
                onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
              />
              <label htmlFor="visible" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Zichtbaar op website
              </label>
            </div>

            {error && (
              <div className="rounded-md bg-red-100 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800/50">
                <div className="flex">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400 dark:text-red-500" aria-hidden="true" />
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className={cc.button.base({ color: 'secondary' })}
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cc.button.base({ color: 'primary' })}
            >
              {isSubmitting ? 'Bezig met opslaan...' : album ? 'Opslaan' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 