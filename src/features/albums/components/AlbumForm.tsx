import { useState, useRef, useCallback } from 'react'
import { supabase } from '../../../lib/supabase/supabaseClient'
import { ErrorText, SmallText } from '../../../components/typography'
import type { AlbumWithDetails } from '../types'
import { uploadToCloudinary } from '../../../lib/cloudinary/cloudinaryClient'
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'

interface AlbumFormProps {
  album?: AlbumWithDetails
  onComplete: () => void
  onCancel: () => void
}

export function AlbumForm({ album, onComplete, onCancel }: AlbumFormProps) {
  const [formData, setFormData] = useState({
    title: album?.title || '',
    description: album?.description || '',
    visible: album?.visible ?? true,
  })
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Afbeelding mag niet groter zijn dan 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Alleen afbeeldingen zijn toegestaan')
      return
    }

    setCoverImage(file)
    setError(null)
  }, [])

  const handleRemoveCover = useCallback(() => {
    setCoverImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return
    setError(null)
    setIsSubmitting(true)
    
    try {
      let cover_photo_id = album?.cover_photo_id

      if (coverImage) {
        setUploadProgress(0)
        const uploadResult = await uploadToCloudinary(coverImage, setUploadProgress)
        
        const { data: photoData, error: photoError } = await supabase
          .from('photos')
          .insert({
            url: uploadResult.url,
            alt: formData.title,
            title: `Cover - ${formData.title}`,
            description: null,
            year: new Date().getFullYear(),
            visible: true,
            order_number: 0
          })
          .select()
          .single()

        if (photoError) throw photoError
        cover_photo_id = photoData.id
      }

      // Get highest order number for new albums
      let order_number = album?.order_number
      if (!order_number) {
        const { data: lastAlbum } = await supabase
          .from('albums')
          .select('order_number')
          .order('order_number', { ascending: false })
          .limit(1)
        
        order_number = (lastAlbum?.[0]?.order_number || 0) + 1
      }

      const albumData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        cover_photo_id,
        visible: formData.visible,
        order_number
      }

      let error
      if (album) {
        // Update bestaand album
        const { error: updateError } = await supabase
          .from('albums')
          .update(albumData)
          .eq('id', album.id)
        error = updateError
      } else {
        // Maak nieuw album
        const { error: insertError } = await supabase
          .from('albums')
          .insert(albumData)
        error = insertError
      }

      if (error) throw error

      onComplete()
    } catch (err) {
      console.error('Error saving album:', err)
      setError('Er ging iets mis bij het opslaan van het album')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            {album ? 'Album bewerken' : 'Nieuw album'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              disabled={isSubmitting}
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
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cover foto
            </label>
            <div className="mt-1 space-y-2">
              {(album?.cover_photo || coverImage) ? (
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
                  <img
                    src={coverImage ? URL.createObjectURL(coverImage) : album?.cover_photo?.url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 group-hover:bg-white rounded-full text-gray-600 hover:text-red-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="aspect-video bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Klik om een cover foto te kiezen</p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100
                  disabled:opacity-50"
                disabled={isSubmitting}
              />
              <SmallText>
                Maximaal 5MB, alleen afbeeldingen toegestaan
              </SmallText>
            </div>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-100">
                <div
                  style={{ width: `${uploadProgress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-300"
                />
              </div>
              <SmallText className="mt-1">
                Uploading... {uploadProgress}%
              </SmallText>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <ErrorText>{error}</ErrorText>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full" />
              )}
              {album ? 'Opslaan' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 