import { useState } from 'react'
import { SponsorFormData } from '../types'
import { sponsorService } from '../services/sponsorService'
import { cc } from '../../../styles/shared'
import { uploadPartnerLogo } from '../../../api/client/cloudinary'
import { SmallText } from '../../../components/typography/typography'
import { Modal, ModalActions } from '../../../components/ui'
import { useImageUpload } from '../../../hooks/useImageUpload'
import { XMarkIcon } from '@heroicons/react/24/outline'

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

  // Set initial preview if editing
  useState(() => {
    if (initialData?.logoUrl) {
      setPreviewUrl(initialData.logoUrl)
    }
  })

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      let finalLogoUrl = formData.logoUrl

      const uploadedUrl = await uploadFile()
      if (uploadedUrl) {
        finalLogoUrl = uploadedUrl
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

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={initialData?.id ? 'Sponsor bewerken' : 'Nieuwe sponsor'}
      size="md"
      footer={
        <ModalActions
          onCancel={onCancel}
          onConfirm={handleSubmit}
          cancelText="Annuleren"
          confirmText={initialData?.id ? 'Opslaan' : 'Toevoegen'}
          isLoading={isSubmitting}
        />
      }
    >
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
                    clearFile()
                    setFormData(prev => ({ ...prev, logoUrl: '' }))
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
    </Modal>
  )
}