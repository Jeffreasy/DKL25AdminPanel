import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { SponsorFormData } from '../types'
import { sponsorService } from '../services/sponsorService'

interface Props {
  onComplete: () => void
  onCancel: () => void
  initialData?: SponsorFormData & { id?: string }
}

export function SponsorForm({ onComplete, onCancel, initialData }: Props) {
  const [formData, setFormData] = useState<SponsorFormData>(initialData ?? {
    name: '',
    description: '',
    logoUrl: '',
    websiteUrl: '',
    order: 0,
    isActive: true
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      if (initialData?.id) {
        await sponsorService.updateSponsor(initialData.id, formData)
      } else {
        await sponsorService.createSponsor(formData)
      }
      onComplete()
    } catch (err) {
      console.error('Error saving sponsor:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {initialData ? 'Sponsor bewerken' : 'Nieuwe sponsor'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Naam <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Beschrijving
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Logo URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="logoUrl"
                value={formData.logoUrl}
                onChange={e => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Website URL
              </label>
              <input
                type="url"
                id="websiteUrl"
                value={formData.websiteUrl}
                onChange={e => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                Volgorde <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="order"
                value={formData.order}
                onChange={e => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Actief
              </label>
            </div>
          </div>

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
              {isSubmitting ? 'Bezig...' : initialData ? 'Opslaan' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 