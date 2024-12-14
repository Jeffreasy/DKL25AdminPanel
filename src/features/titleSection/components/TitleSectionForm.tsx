import { useState } from 'react'
import { supabase } from '../../../lib/supabase/supabaseClient'
import { TitleSection } from '../../../types/titleSection'

interface TitleSectionFormProps {
  titleSection: TitleSection
  onComplete: () => void
  onCancel: () => void
}

export function TitleSectionForm({ titleSection, onComplete, onCancel }: TitleSectionFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: titleSection.title,
    subtitle: titleSection.subtitle,
    cta_text: titleSection.cta_text,
    image_url: titleSection.image_url,
    event_details: titleSection.event_details
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('title_sections')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', titleSection.id)

      if (error) throw error

      onComplete()
    } catch (err) {
      console.error('Form error:', err)
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  const handleEventDetailChange = (index: number, field: keyof typeof formData.event_details[0], value: string) => {
    const newDetails = [...formData.event_details]
    newDetails[index] = { ...newDetails[index], [field]: value }
    setFormData({ ...formData, event_details: newDetails })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          Titel Sectie Bewerken
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hoofdtitel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hoofdtitel
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          {/* Subtitel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subtitel
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          {/* CTA Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Call-to-Action Tekst
            </label>
            <input
              type="text"
              value={formData.cta_text}
              onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          {/* Afbeelding URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Afbeelding URL
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Event Details
            </label>
            {formData.event_details.map((detail, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Icon</label>
                  <input
                    type="text"
                    value={detail.icon}
                    onChange={(e) => handleEventDetailChange(index, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                      focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                      dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Titel</label>
                  <input
                    type="text"
                    value={detail.title}
                    onChange={(e) => handleEventDetailChange(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                      focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                      dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Beschrijving</label>
                  <input
                    type="text"
                    value={detail.description}
                    onChange={(e) => handleEventDetailChange(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                      focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
                      dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Form buttons */}
          <div className="flex justify-end space-x-3">
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