import { useState, useRef } from 'react'
import { supabase } from '../../../lib/supabase/supabaseClient'
import { ErrorText, SmallText } from '../../../components/typography'
import type { Database, CustomFileOptions } from '../../../types/supabase'

type Partner = Database['public']['Tables']['partners']['Row']
type PartnerInsert = Database['public']['Tables']['partners']['Insert']

interface PartnerFormProps {
  partner?: Partner
  onComplete: () => void
  onCancel: () => void
}

export function PartnerForm({ partner, onComplete, onCancel }: PartnerFormProps) {
  const [name, setName] = useState(partner?.name || '')
  const [description, setDescription] = useState(partner?.description || '')
  const [website, setWebsite] = useState(partner?.website || '')
  const [tier, setTier] = useState<Partner['tier']>(partner?.tier || 'bronze')
  const [logo, setLogo] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(partner?.logo || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setLogo(file)
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
    setIsSubmitting(true)
    setError(null)
    setUploadProgress(0)

    try {
      let logoPath = partner?.logo || ''

      if (logo) {
        const fileExt = logo.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `partner-logos/${fileName}`

        const uploadOptions: CustomFileOptions = {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percentage = (progress.loaded / progress.total) * 100
            setUploadProgress(Math.round(percentage))
          },
        }

        const { error: uploadError } = await supabase.storage
          .from('partners')
          .upload(filePath, logo, uploadOptions)

        if (uploadError) throw uploadError

        // Haal direct de publieke URL op
        const { data: { publicUrl } } = supabase.storage
          .from('partners')
          .getPublicUrl(filePath)

        // Sla de volledige URL op in de database
        logoPath = publicUrl

        // Verwijder oude logo als die bestaat
        if (partner?.logo) {
          const oldPath = new URL(partner.logo).pathname.split('/').pop()
          if (oldPath) {
            await supabase.storage
              .from('partners')
              .remove([`partner-logos/${oldPath}`])
          }
        }
      }

      let orderNumber = partner?.order_number || 0
      if (!partner?.order_number) {
        const { data: partners } = await supabase
          .from('partners')
          .select('order_number')
          .order('order_number', { ascending: false })
          .limit(1)
        
        orderNumber = ((partners?.[0]?.order_number || 0) + 1)
      }

      const partnerData: PartnerInsert = {
        name,
        description,
        logo: logoPath,
        website,
        since: new Date().toISOString().split('T')[0],
        tier,
        visible: true,
        order_number: orderNumber,
      }

      const { error: dbError } = await supabase
        .from('partners')
        .upsert({
          id: partner?.id,
          ...partnerData,
        })

      if (dbError) throw dbError

      onComplete()
    } catch (err) {
      console.error('Form error:', err)
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setIsSubmitting(false)
      setUploadProgress(0)
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
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
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
          value={tier}
          onChange={(e) => setTier(e.target.value as Partner['tier'])}
          className="mt-1 input-primary"
          required
        >
          <option value="bronze">Bronze</option>
          <option value="silver">Silver</option>
          <option value="gold">Gold</option>
        </select>
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
                  setLogo(null)
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

      {/* Upload progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 text-xs flex rounded bg-primary-100">
            <div
              style={{ width: `${uploadProgress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-300"
            />
          </div>
          <SmallText className="mt-1">
            Uploading... {uploadProgress}%
          </SmallText>
        </div>
      )}

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