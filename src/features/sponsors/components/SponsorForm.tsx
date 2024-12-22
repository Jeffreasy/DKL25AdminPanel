import { useState } from 'react'
import { uploadToCloudinary } from '../../../lib/cloudinary/cloudinaryClient'
import { SmallText } from '../../../components/typography'
import type { Sponsor } from '../types'

interface SponsorFormProps {
  sponsor?: Sponsor
  onComplete: () => void
  onCancel: () => void
}

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// TODO: Vervang dit door je nieuwe API service
const saveSponsorToAPI = async (params: {
  id?: string
  name: string
  description?: string
  logo?: string
  website_url?: string
  visible: boolean
  order_number: number
}): Promise<void> => {
  // Implementeer je nieuwe API call hier
  console.log('Saving sponsor with params:', params)
}

export function SponsorForm({ sponsor, onComplete, onCancel }: SponsorFormProps) {
  const [formData, setFormData] = useState({
    name: sponsor?.name || '',
    description: sponsor?.description || '',
    website_url: sponsor?.website_url || '',
    visible: sponsor?.visible ?? true,
    order_number: sponsor?.order_number || 0
  })
  const [logo, setLogo] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Alleen JPG, PNG en WEBP bestanden zijn toegestaan'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Bestand is te groot (max 2MB)'
    }
    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const error = validateFile(file)
    if (error) {
      setError(error)
      return
    }

    setLogo(file)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      let logo_url = sponsor?.logo_url

      if (logo) {
        const uploadResult = await uploadToCloudinary(
          logo,
          (progress) => {
            const percentage = Math.round((progress.loaded / progress.total) * 100)
            setUploadProgress(percentage)
          }
        )
        logo_url = uploadResult.url
      }

      if (!logo_url) {
        throw new Error('Logo is verplicht')
      }

      await saveSponsorToAPI({
        name: formData.name,
        description: formData.description || undefined,
        logo: logo_url,
        website_url: formData.website_url || undefined,
        visible: formData.visible,
        order_number: formData.order_number
      })

      onComplete()
    } catch (err) {
      console.error('Error saving sponsor:', err)
      setError(err instanceof Error ? err.message : 'Er ging iets mis bij het opslaan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-lg">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">
            {sponsor ? 'Sponsor bewerken' : 'Nieuwe sponsor'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Logo upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Logo</label>
            <div className="mt-2 flex items-center gap-4">
              {(sponsor?.logo_url || logo) && (
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={logo ? URL.createObjectURL(logo) : sponsor?.logo_url}
                    alt="Logo preview"
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              )}
              <input
                type="file"
                accept={ALLOWED_FILE_TYPES.join(',')}
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
            </div>
            <SmallText>Aanbevolen formaat: 400x200 pixels, max 2MB</SmallText>

            {/* Upload progress bar */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Logo uploaden...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Naam */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Naam
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>

          {/* Website URL */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Website URL
            </label>
            <input
              type="url"
              id="website"
              value={formData.website_url}
              onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="https://"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {/* Zichtbaarheid */}
          <div className="flex items-center justify-between">
            <label htmlFor="visible" className="text-sm font-medium text-gray-700">
              Zichtbaar op website
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={formData.visible}
              onClick={() => setFormData(prev => ({ ...prev, visible: !prev.visible }))}
              className={`${
                formData.visible ? 'bg-indigo-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              <span
                aria-hidden="true"
                className={`${
                  formData.visible ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
              disabled={isSubmitting}
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
            >
              {isSubmitting ? 'Bezig met opslaan...' : sponsor ? 'Opslaan' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 