import { useState, useRef } from 'react'
import { ErrorText, SmallText } from '../../../components/typography'
import type { Photo } from '../types'
import { supabase } from '../../../lib/supabase'
import { uploadToCloudinary } from '../../../lib/cloudinary/cloudinaryClient'

interface PhotoFormProps {
  photo?: Photo
  onComplete: () => void
  onCancel: () => void
}

const savePhotoToAPI = async (params: {
  id?: string
  url: string
  alt: string
  title: string
  description?: string
  thumbnail_url?: string
  visible: boolean
  order_number: number
  year: number
}): Promise<void> => {
  if (params.id) {
    // Update bestaande foto
    const { error } = await supabase
      .from('photos')
      .update({
        url: params.url,
        alt: params.alt,
        title: params.title,
        description: params.description,
        thumbnail_url: params.thumbnail_url,
        visible: params.visible,
        order_number: params.order_number,
        year: params.year,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (error) throw error
  } else {
    // Nieuwe foto toevoegen
    const { error } = await supabase
      .from('photos')
      .insert([{
        url: params.url,
        alt: params.alt,
        title: params.title,
        description: params.description,
        thumbnail_url: params.thumbnail_url,
        visible: params.visible,
        order_number: params.order_number,
        year: params.year
      }])

    if (error) throw error
  }
}

const getLastOrderNumber = async (): Promise<number> => {
  const { data, error } = await supabase
    .from('photos')
    .select('order_number')
    .order('order_number', { ascending: false })
    .limit(1)
    .single()

  if (error) return 0
  return (data?.order_number || 0) + 1
}

export function PhotoForm({ photo, onComplete, onCancel }: PhotoFormProps) {
  const [formData, setFormData] = useState({
    title: photo?.title || '',
    alt: photo?.alt || '',
    description: photo?.description || '',
    year: photo?.year || new Date().getFullYear(),
    visible: photo?.visible ?? true,
    order_number: photo?.order_number || 0
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

      const orderNumber = photo?.order_number || await getLastOrderNumber()

      await savePhotoToAPI({
        id: photo?.id,
        url,
        alt: formData.alt || formData.title,
        title: formData.title,
        description: formData.description,
        thumbnail_url,
        visible: formData.visible,
        order_number: orderNumber,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-lg">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">
            {photo ? 'Foto bewerken' : 'Nieuwe foto'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Titel */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Titel *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Alt text */}
          <div>
            <label htmlFor="alt" className="block text-sm font-medium text-gray-700">
              Alt tekst *
            </label>
            <input
              type="text"
              id="alt"
              value={formData.alt}
              onChange={(e) => setFormData(prev => ({ ...prev, alt: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          {/* Jaar */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">
              Jaar *
            </label>
            <input
              type="number"
              id="year"
              value={formData.year}
              onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              min={2000}
              max={new Date().getFullYear()}
              required
            />
          </div>

          {/* Foto upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Foto {!photo && '*'}
            </label>
            <div className="mt-2 flex items-center space-x-4">
              {(photo?.url || photo?.thumbnail_url) && (
                <img
                  src={photo.thumbnail_url || photo.url}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            <SmallText>
              Maximum 5MB, alleen afbeeldingen
            </SmallText>
          </div>

          {/* Zichtbaarheid */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="visible"
              checked={formData.visible}
              onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="visible" className="text-sm text-gray-700">
              Zichtbaar op website
            </label>
          </div>

          {error && <ErrorText>{error}</ErrorText>}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
            >
              {isSubmitting ? 'Bezig met opslaan...' : photo ? 'Opslaan' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 