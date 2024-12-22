import { useState, useRef } from 'react'
import { ErrorText, SmallText } from '../../../components/typography'
import type { Partner, CreatePartnerData } from '../types'
import { createPartner, updatePartner } from '../services/partnerService'
import { uploadPartnerLogo } from '../../../lib/cloudinary/cloudinaryClient'
import { isAdmin } from '../../../lib/supabase'

interface PartnerFormProps {
  partner?: Partner
  onComplete: () => void
  onCancel: () => void
}

interface FormData {
  name: string
  description: string
  website: string
  tier: Partner['tier']
  since: string
  visible: boolean
  order_number: number
}

export function PartnerForm({ partner, onComplete, onCancel }: PartnerFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: partner?.name || '',
    description: partner?.description || '',
    website: partner?.website || '',
    tier: partner?.tier || 'bronze',
    since: partner?.since || new Date().toISOString().split('T')[0],
    visible: partner?.visible ?? true,
    order_number: partner?.order_number || 0
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(partner?.logo || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Valideer bestandsgrootte (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo mag niet groter zijn dan 2MB')
      return
    }

    // Valideer bestandstype
    if (!file.type.startsWith('image/')) {
      setError('Alleen afbeeldingsbestanden zijn toegestaan')
      return
    }

    setLogoFile(file)
    setError(null)

    // Maak preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    try {
      // Check of gebruiker admin is
      const isUserAdmin = await isAdmin()
      if (!isUserAdmin) {
        setError('Je hebt geen rechten om partners te beheren')
        return
      }

      setIsSubmitting(true)
      setError(null)

      // Upload logo if changed
      let logo = partner?.logo
      if (logoFile) {
        try {
          const result = await uploadPartnerLogo(logoFile)
          logo = result.secure_url
        } catch (err) {
          console.error('Logo upload error:', err)
          setError('Logo upload mislukt')
          return
        }
      }

      const partnerData: CreatePartnerData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        logo,
        website: formData.website.trim() || undefined,
        tier: formData.tier,
        since: formData.since,
        visible: formData.visible,
        order_number: formData.order_number
      }

      console.log('Submitting partner data:', partnerData)

      if (partner) {
        await updatePartner(partner.id, partnerData)
      } else {
        await createPartner(partnerData)
      }

      onComplete()
    } catch (err) {
      console.error('Error saving partner:', err)
      setError('Er ging iets mis bij het opslaan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Naam *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={handleInputChange}
          name="name"
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
          value={formData.description}
          onChange={handleInputChange}
          name="description"
          className="mt-1 input-primary"
          rows={3}
        />
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700">
          Website
        </label>
        <input
          type="url"
          id="website"
          value={formData.website}
          onChange={handleInputChange}
          name="website"
          className="mt-1 input-primary"
          placeholder="https://..."
        />
      </div>

      <div>
        <label htmlFor="tier" className="block text-sm font-medium text-gray-700">
          Niveau *
        </label>
        <select
          id="tier"
          value={formData.tier}
          onChange={handleInputChange}
          name="tier"
          className="mt-1 input-primary"
          required
        >
          <option value="bronze">Bronze</option>
          <option value="silver">Silver</option>
          <option value="gold">Gold</option>
        </select>
      </div>

      <div>
        <label htmlFor="since" className="block text-sm font-medium text-gray-700">
          Partner sinds *
        </label>
        <input
          type="date"
          id="since"
          value={formData.since}
          onChange={handleInputChange}
          name="since"
          className="mt-1 input-primary"
          required
        />
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.visible}
            onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
            name="visible"
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700">Zichtbaar op website</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Logo
        </label>
        <div className="mt-1 space-y-2">
          {/* Preview */}
          {previewUrl && (
            <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={previewUrl}
                alt="Logo preview"
                className="w-full h-full object-contain p-2"
              />
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null)
                  setLogoFile(null)
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
            id="logo"
            accept="image/*"
            onChange={handleLogoChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-primary-50 file:text-primary-700
              hover:file:bg-primary-100"
          />
          <SmallText>
            Maximaal 2MB, alleen afbeeldingen toegestaan
          </SmallText>
        </div>
      </div>

      {error && <ErrorText>{error}</ErrorText>}

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
          className="btn-primary"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Bezig...
            </div>
          ) : partner ? 'Opslaan' : 'Toevoegen'}
        </button>
      </div>
    </form>
  )
} 