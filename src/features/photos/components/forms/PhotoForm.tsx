import { useState, useRef } from 'react'
import { ErrorText, SmallText } from '../../../../components/typography/typography'
import type { Photo } from '../../types'
import { supabase } from '../../../../api/client/supabase'
import { uploadToCloudinary } from '../../../../api/client/cloudinary'
import { cc } from '../../../../styles/shared'

interface PhotoFormProps {
  photo?: Photo
  onComplete: () => void
  onCancel: () => void
}

const savePhotoToAPI = async (params: {
  id?: string
  url: string
  alt_text: string
  title: string
  description?: string
  thumbnail_url?: string
  visible: boolean
  year: number
}): Promise<void> => {
  if (params.id) {
    // Update bestaande foto
    const updateData: Partial<Photo> = {
        url: params.url,
        alt_text: params.alt_text,
        title: params.title,
        description: params.description,
        thumbnail_url: params.thumbnail_url,
        visible: params.visible,
        year: String(params.year),
        updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('photos')
      .update(updateData)
      .eq('id', params.id)

    if (error) throw error
  } else {
    // Nieuwe foto toevoegen
    const insertData: Partial<Omit<Photo, 'id' | 'created_at' | 'updated_at' | 'album_photos'>> = {
        url: params.url,
        alt_text: params.alt_text,
        title: params.title,
        description: params.description,
        thumbnail_url: params.thumbnail_url,
        visible: params.visible,
        year: String(params.year)
    };
    
    const { error } = await supabase
      .from('photos')
      .insert([insertData])

    if (error) throw error
  }
}

export function PhotoForm({ photo, onComplete, onCancel }: PhotoFormProps) {
  const [formData, setFormData] = useState({
    title: photo?.title || '',
    alt_text: photo?.alt_text || '',
    description: photo?.description || '',
    year: photo?.year || new Date().getFullYear(),
    visible: photo?.visible ?? true,
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    
    try {
      setIsSubmitting(true)
      
      let url = photo?.url
      let thumbnail_url = photo?.thumbnail_url || undefined

      if (fileInputRef.current?.files?.length) {
        const file = fileInputRef.current.files[0]
        const result = await uploadToCloudinary(file)
        url = result.secure_url
        thumbnail_url = result.secure_url.replace('/upload/', '/upload/c_thumb,w_200,g_face/')
      }

      if (!url) {
        throw new Error('Foto is verplicht')
      }

      await savePhotoToAPI({
        id: photo?.id,
        url,
        alt_text: formData.alt_text || formData.title,
        title: formData.title,
        description: formData.description,
        thumbnail_url,
        visible: formData.visible,
        year: Number(formData.year)
      })

      onComplete()
    } catch (err) {
      console.error('Error saving photo:', err)
      setError(err instanceof Error ? err.message : 'Er ging iets mis bij het opslaan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`fixed inset-0 ${cc.overlay.medium} flex items-center justify-center ${cc.spacing.container.sm} z-50`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg shadow-xl">
        <div className={`${cc.spacing.container.sm} border-b border-gray-200 dark:border-gray-700`}>
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {photo ? 'Foto bewerken' : 'Nieuwe foto'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className={`${cc.spacing.container.sm} ${cc.spacing.section.sm}`}>
          {/* Titel */}
          <div>
            <label htmlFor="title" className={cc.form.label()}>
              Titel *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={cc.form.input({ className: 'mt-1' })}
              required
            />
          </div>

          {/* Alt text */}
          <div>
            <label htmlFor="alt_text" className={cc.form.label()}>
              Alt tekst *
            </label>
            <input
              type="text"
              id="alt_text"
              value={formData.alt_text}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
              className={cc.form.input({ className: 'mt-1' })}
              required
            />
          </div>

          {/* Beschrijving */}
          <div>
            <label htmlFor="description" className={cc.form.label()}>
              Beschrijving
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={cc.form.input({ className: 'mt-1' })}
              rows={3}
            />
          </div>

          {/* Jaar */}
          <div>
            <label htmlFor="year" className={cc.form.label()}>
              Jaar *
            </label>
            <input
              type="number"
              id="year"
              value={formData.year}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              className={cc.form.input({ className: 'mt-1' })}
              min={2000}
              max={new Date().getFullYear()}
              required
            />
          </div>

          {/* Foto upload */}
          <div>
            <label className={cc.form.label()}>
              Foto {!photo && '*'}
            </label>
            <div className="mt-2 flex items-center space-x-4">
              {(photo?.url || photo?.thumbnail_url) && (
                <img
                  src={photo.thumbnail_url || photo.url}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                />
              )}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/50 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900"
              />
            </div>
            <SmallText className="text-gray-500 dark:text-gray-400">
              Maximum 5MB, alleen afbeeldingen
            </SmallText>
          </div>

          {/* Zichtbaarheid */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="visible"
              checked={formData.visible}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
              className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-700"
            />
            <label htmlFor="visible" className="text-sm text-gray-700 dark:text-gray-300">
              Zichtbaar op website
            </label>
          </div>

          {error && <ErrorText>{error}</ErrorText>}

          <div className={`flex justify-end ${cc.spacing.gap.md} pt-4`}>
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
              {isSubmitting ? 'Bezig met opslaan...' : photo ? 'Opslaan' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 