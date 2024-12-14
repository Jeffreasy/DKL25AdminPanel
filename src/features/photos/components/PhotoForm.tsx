import { useState } from 'react'
import { supabase } from '../../../lib/supabase/supabaseClient'
import { Photo } from '../../../types/photo'

interface PhotoFormProps {
  photo?: Photo
  onComplete: () => void
  onCancel: () => void
}

export function PhotoForm({ photo, onComplete, onCancel }: PhotoFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alt, setAlt] = useState(photo?.alt || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (photo) {
        // Update bestaande foto
        const { error } = await supabase
          .from('photos')
          .update({
            alt,
            updated_at: new Date().toISOString()
          })
          .eq('id', photo.id)

        if (error) throw error
      }

      onComplete()
    } catch (err) {
      console.error('Form error:', err)
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
        <h2 className="text-xl font-semibold mb-4">
          {photo ? 'Foto Bewerken' : 'Nieuwe Foto'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Preview van de foto */}
          {photo && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
              <img
                src={photo.url}
                alt={photo.alt}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Alt text input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alt Text
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Beschrijf de foto"
              required
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Form buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border 
                border-gray-300 rounded-md shadow-sm hover:bg-gray-50
                dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 
                dark:hover:bg-gray-600"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 
                rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none 
                focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Bezig...' : 'Opslaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 