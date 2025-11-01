import { useState } from 'react'
import { SmallText } from '../../../components/typography/typography'
import type { Partner, CreatePartnerData } from '../types'
import { createPartner, updatePartner } from '../services/partnerService'
import { uploadPartnerLogo } from '../../../api/client/cloudinary'
import { usePermissions } from '../../../hooks/usePermissions'
import { cc } from '../../../styles/shared'
import { Modal, ModalActions } from '../../../components/ui'
import { useImageUpload } from '../../../hooks/useImageUpload'
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
  const { hasPermission } = usePermissions()
  const [formData, setFormData] = useState<FormData>({
    name: partner?.name || '',
    description: partner?.description || '',
    website: partner?.website || '',
    tier: partner?.tier || 'bronze',
    since: partner?.since || new Date().toISOString().split('T')[0],
    visible: partner?.visible ?? true,
    order_number: partner?.order_number || 0
  })
  
  const {
    previewUrl,
    error: uploadError,
    fileInputRef,
    handleFileChange,
    clearFile,
    uploadFile,
    setPreviewUrl
  } = useImageUpload({
    maxSizeMB: 2,
    uploadFunction: uploadPartnerLogo
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Set initial preview if editing
  useState(() => {
    if (partner?.logo) {
      setPreviewUrl(partner.logo)
    }
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    try {
      // Check of gebruiker partner write permissions heeft
      if (!hasPermission('partner', 'write')) {
        setError('Je hebt geen rechten om partners te beheren')
        return
      }

      setIsSubmitting(true)
      setError(null)

      // Upload logo if changed
      let logo = partner?.logo
      const uploadedUrl = await uploadFile()
      if (uploadedUrl) {
        logo = uploadedUrl
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
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={partner ? 'Partner Bewerken' : 'Partner Toevoegen'}
      size="md"
      footer={
        <ModalActions
          onCancel={onCancel}
          onConfirm={handleSubmit}
          cancelText="Annuleren"
          confirmText={partner ? 'Wijzigingen Opslaan' : 'Partner Opslaan'}
          isLoading={isSubmitting}
        />
      }
    >
      <div className={`${cc.spacing.container.md} ${cc.spacing.section.sm}`}>
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
                  onClick={clearFile}
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
                onChange={handleFileChange}
                className="hidden"
              />
              <SmallText>Max 2MB. Png, Jpg, Webp.</SmallText>
            </div>
            {uploadError && (
              <p className={cc.form.error()}>{uploadError}</p>
            )}
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
      </div>
    </Modal>
  )
}