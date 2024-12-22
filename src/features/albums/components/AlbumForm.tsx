import { useState, useRef, useCallback } from 'react'
import { SmallText } from '../../../components/typography'
import type { AlbumWithDetails } from '../types'
import { uploadToCloudinary } from '../../../lib/cloudinary/cloudinaryClient'
import { PhotoSelector } from './PhotoSelector'
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'

// TODO: Vervang dit door je nieuwe API service
const saveAlbumToAPI = async (_params: {
  title: string
  description: string
  coverPhotoUrl: string | null
  visible: boolean
}) => {
  // Implementeer je nieuwe API call hier
}

interface AlbumFormProps {
  album?: AlbumWithDetails
  onComplete: () => void
  onCancel: () => void
}

export function AlbumForm({ album, onComplete, onCancel }: AlbumFormProps) {
  const [formData, setFormData] = useState({
    title: album?.title || '',
    description: album?.description || '',
    visible: album?.visible ?? false
  })
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPhotoSelector, setShowPhotoSelector] = useState(false)
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
    
    try {
      setIsSubmitting(true)
      
      let coverPhotoUrl = null
      if (coverImage) {
        const uploadResult = await uploadToCloudinary(coverImage, 
          (progress) => {
            setUploadProgress(Math.round((progress.loaded / progress.total) * 100))
          }
        )
        coverPhotoUrl = uploadResult.url
      }

      await saveAlbumToAPI({
        title: formData.title,
        description: formData.description,
        coverPhotoUrl,
        visible: formData.visible
      })

      onComplete()
    } catch (err) {
      setError('Er ging iets mis bij het opslaan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-lg">
          <form onSubmit={handleSubmit}>
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

            <div className="p-4 space-y-4">
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
                <div className="text-sm text-red-600 mt-2">
                  {error}
                </div>
              )}

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="visible" className="block text-sm font-medium text-gray-700">
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
                <p className="mt-1 text-sm text-gray-500">
                  Als dit album zichtbaar is, worden de foto's getoond op de website
                </p>
              </div>

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
            </div>
          </form>
        </div>
      </div>

      {/* Photo Selector Modal */}
      {showPhotoSelector && (
        <PhotoSelector
          album={{
            id: crypto.randomUUID(),
            title: formData.title,
            description: formData.description,
            visible: formData.visible,
            cover_photo: null,
            cover_photo_id: null,
            photos_count: 0,
            order_number: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }}
          onComplete={() => {
            setShowPhotoSelector(false)
            onComplete()
          }}
          onCancel={() => {
            setShowPhotoSelector(false)
            onComplete()
          }}
        />
      )}
    </>
  )
} 