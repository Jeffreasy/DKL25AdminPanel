import { useState, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { SponsorFormData } from '../types'
import { sponsorService } from '../services/sponsorService'
import { cc } from '../../../styles/shared'
import { uploadPartnerLogo } from '../../../lib/cloudinary/cloudinaryClient'
import { SmallText } from '../../../components/typography'

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
    isActive: true,
    visible: true
  })
  
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.logoUrl || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      let finalLogoUrl = formData.logoUrl

      if (logoFile) {
        setLogoError(null)
        try {
          const uploadResult = await uploadPartnerLogo(logoFile)
          finalLogoUrl = uploadResult.secure_url
        } catch (uploadErr) {
          console.error('Logo upload error:', uploadErr)
          setLogoError('Logo upload mislukt. Controleer het bestand en probeer opnieuw.')
          setIsSubmitting(false)
          return
        }
      }

      const dataToSend: SponsorFormData = {
        ...formData,
        logoUrl: finalLogoUrl
      }

      if (initialData?.id) {
        await sponsorService.updateSponsor(initialData.id, dataToSend)
      } else {
        await sponsorService.createSponsor(dataToSend)
      }
      onComplete()
    } catch (err) {
      console.error('Error saving sponsor:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Logo mag niet groter zijn dan 2MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setLogoError('Alleen afbeeldingsbestanden zijn toegestaan (PNG, JPG, WebP etc.)')
      return
    }

    setLogoFile(file)
    setLogoError(null)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className={`fixed inset-0 ${cc.overlay.medium} backdrop-blur-sm z-50 flex items-center justify-center ${cc.spacing.container.sm}`}>
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
        <div className={`${cc.spacing.px.md} ${cc.spacing.py.sm} border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0`}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {initialData?.id ? 'Sponsor bewerken' : 'Nieuwe sponsor'}
          </h2>
          <button
            onClick={onCancel}
            className={cc.button.icon({ color: 'secondary' })}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
          <div className={`${cc.spacing.container.md} ${cc.spacing.section.md}`}>
            <div>
              <label htmlFor="name" className={cc.form.label()}>
                Naam <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className={cc.form.input({ className: 'mt-1' })}
              />
            </div>

            <div>
              <label className={cc.form.label()}>Logo</label>
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
                        setFormData(prev => ({ ...prev, logoUrl: '' }))
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                      className={cc.button.iconDanger({ size: 'sm', className: 'absolute top-2 right-2' })}
                    >
                      <XMarkIcon className="w-4 h-4" />
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
                {logoError && (
                  <p className={cc.form.error()}>{logoError}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="websiteUrl" className={cc.form.label()}>
                Website URL
              </label>
              <input
                type="url"
                id="websiteUrl"
                value={formData.websiteUrl}
                onChange={e => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                className={cc.form.input({ className: 'mt-1' })}
              />
            </div>

            <div>
              <label htmlFor="order" className={cc.form.label()}>
                Volgorde <span className="text-red-600 dark:text-red-400">*</span>
              </label>
              <input
                type="number"
                id="order"
                value={formData.order}
                onChange={e => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                className={cc.form.input({ className: 'mt-1' })}
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:bg-gray-700 dark:checked:bg-indigo-500 dark:focus:ring-offset-gray-800"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Actief
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="visible"
                checked={formData.visible}
                onChange={e => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:bg-gray-700 dark:checked:bg-indigo-500 dark:focus:ring-offset-gray-800"
              />
              <label htmlFor="visible" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Zichtbaar
              </label>
            </div>
          </div>

          <div className={`${cc.spacing.px.md} ${cc.spacing.py.sm} bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end ${cc.spacing.gap.md} flex-shrink-0`}>
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
              {isSubmitting ? 'Bezig...' : initialData?.id ? 'Opslaan' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 