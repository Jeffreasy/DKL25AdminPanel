import { useState, useRef } from 'react'
import { ErrorText, SmallText } from '../../../components/typography'
import type { Partner, CreatePartnerData } from '../types'
import { createPartner, updatePartner } from '../services/partnerService'
import { uploadPartnerLogo } from '../../../lib/cloudinary/cloudinaryClient'
import { isAdmin } from '../../../lib/supabase'
import { cc } from '../../../styles/shared'
import { XMarkIcon } from '@heroicons/react/24/outline'

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
    <div className={`fixed inset-0 ${cc.overlay.medium} overflow-y-auto h-full w-full z-40 flex items-center justify-center ${cc.spacing.container.sm}`}>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-auto border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
        <div className={`${cc.spacing.px.md} ${cc.spacing.py.sm} border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0`}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {partner ? 'Partner Bewerken' : 'Partner Toevoegen'}
          </h2>
          <button
            onClick={onCancel}
            className={cc.button.icon({ color: 'secondary' })}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className={`flex-grow overflow-y-auto ${cc.spacing.container.md} ${cc.spacing.section.sm}`}>
          <div>
            <label htmlFor="name" className={cc.form.label()}>
              Naam *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              name="name"
              className={cc.form.input({ className: 'mt-1' })}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className={cc.form.label()}>
              Beschrijving
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleInputChange}
              name="description"
              className={cc.form.input({ className: 'mt-1' })}
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="website" className={cc.form.label()}>
              Website
            </label>
            <input
              type="url"
              id="website"
              value={formData.website}
              onChange={handleInputChange}
              name="website"
              className={cc.form.input({ className: 'mt-1' })}
              placeholder="https://..."
            />
          </div>

          <div>
            <label htmlFor="tier" className={cc.form.label()}>
              Niveau *
            </label>
            <select
              id="tier"
              value={formData.tier}
              onChange={handleInputChange}
              name="tier"
              className={cc.form.select({ className: 'mt-1' })}
              required
            >
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
            </select>
          </div>

          <div>
            <label htmlFor="since" className={cc.form.label()}>
              Partner sinds *
            </label>
            <input
              type="date"
              id="since"
              value={formData.since}
              onChange={handleInputChange}
              name="since"
              className={cc.form.input({ className: 'mt-1' })}
              required
            />
          </div>

          <div>
            <label htmlFor="visible" className="flex items-center gap-2">
              <input
                type="checkbox"
                id="visible"
                checked={formData.visible}
                onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
                name="visible"
                className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:checked:bg-primary-600 dark:focus:ring-primary-600 dark:focus:ring-offset-gray-800"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Zichtbaar op website</span>
            </label>
          </div>

          <div>
            <label className={cc.form.label()}>
              Logo
            </label>
            <div className={`mt-1 ${cc.spacing.section.xs}`}>
              {previewUrl && (
                <div className="relative w-full h-36 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
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
                    className={cc.button.iconDanger({ size: 'sm', className: 'absolute top-2 right-2' })}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <div className={`flex items-center ${cc.spacing.gap.md}`}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={cc.button.base({ color: 'secondary', size: 'sm' })}
                >
                  {previewUrl ? 'Logo Wijzigen' : 'Logo Kiezen'}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <SmallText>Max 2MB. Png, Jpg, Webp.</SmallText>
              </div>
            </div>
          </div>

          {error && (
            <div className={cc.alert({ status: 'error' })}>
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-medium">Fout</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className={`${cc.spacing.px.md} ${cc.spacing.py.sm} bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end ${cc.spacing.gap.md} flex-shrink-0`}>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className={cc.button.base({ color: 'secondary' })}
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cc.button.base({ color: 'primary' })}
            >
              {isSubmitting ? 'Opslaan...' : (partner ? 'Wijzigingen Opslaan' : 'Partner Opslaan')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 