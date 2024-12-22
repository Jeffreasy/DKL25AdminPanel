import { useState, useRef } from 'react'
import { ErrorText, SmallText } from '../../../components/typography'
import type { Photo, PhotoWithDetails } from '../types'

interface PhotoFormProps {
  photo?: Photo | PhotoWithDetails
  onComplete: () => void
  onCancel: () => void
}

// TODO: Vervang dit door je nieuwe API service
const savePhotoToAPI = async (params: {
  id?: string
  url: string
  alt: string
  visible: boolean
  order_number: number
  title?: string
  description?: string
  year?: number
}): Promise<void> => {
  // Implementeer je nieuwe API call hier
  console.log('Saving photo with params:', params)
}

export function PhotoForm({ photo, onComplete, onCancel }: PhotoFormProps) {
  const [formData, setFormData] = useState({
    title: photo && 'title' in photo ? photo.title : '',
    description: photo && 'description' in photo ? photo.description || '' : '',
    year: photo && 'year' in photo ? photo.year : new Date().getFullYear(),
    visible: photo && 'visible' in photo ? photo.visible : true,
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !photo) return
    
    try {
      setIsSubmitting(true)
      
      await savePhotoToAPI({
        id: photo.id,
        url: photo.url,
        alt: formData.title || 'Untitled',
        visible: formData.visible,
        order_number: photo.order_number,
        title: formData.title,
        description: formData.description,
        year: formData.year
      })

      onComplete()
    } catch (err) {
      setError('Er ging iets mis bij het opslaan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-screen-safe sm:max-w-lg max-h-[90vh] overflow-hidden animate-fadeIn">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {photo ? 'Foto bewerken' : 'Nieuwe foto'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Titel *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 input-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Beschrijving
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 input-primary"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">
              Jaar *
            </label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className="mt-1 input-primary"
              min={1900}
              max={new Date().getFullYear()}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Foto
            </label>
            <div className="mt-1 space-y-2">
              {/* Preview */}
              {photo?.url && (
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={photo.url}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ''
                      }
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Upload input */}
              <input
                ref={fileInputRef}
                type="file"
                id="image"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return

                  // Valideer bestandsgrootte (max 5MB)
                  if (file.size > 5 * 1024 * 1024) {
                    setError('Afbeelding mag niet groter zijn dan 5MB')
                    return
                  }

                  // Valideer bestandstype
                  if (!file.type.startsWith('image/')) {
                    setError('Alleen afbeeldingen zijn toegestaan')
                    return
                  }

                  setError(null)
                }}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100"
              />
              <SmallText>
                Maximaal 5MB, alleen afbeeldingen toegestaan
              </SmallText>
            </div>
          </div>

          {error && <ErrorText>{error}</ErrorText>}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {photo ? 'Opslaan' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 