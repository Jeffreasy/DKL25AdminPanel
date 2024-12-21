import { useState, useRef } from 'react'
import { supabase } from '../../../lib/supabase/supabaseClient'
import { H3, ErrorText, SmallText } from '../../../components/typography'
import type { Database } from '../../../types/supabase'
import { uploadToCloudinary } from '../../../lib/cloudinary/cloudinaryClient'

type PhotoInsert = Database['public']['Tables']['photos']['Insert']

interface PhotoUploadModalProps {
  onClose: () => void
  onComplete: () => void
}

interface UploadPreview {
  file: File
  previewUrl: string
  title: string
  year: number
  progress: number
  url?: string
  error?: string
}

export function PhotoUploadModal({ onClose, onComplete }: PhotoUploadModalProps) {
  const [uploads, setUploads] = useState<UploadPreview[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<{[key: string]: number}>({})
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    try {
      setIsUploading(true)
      setError(null)
      const newProgress = {...progress}

      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is groter dan 5MB`)
        }
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is geen afbeelding`)
        }

        const uploadResult = await uploadToCloudinary(
          file,
          (progressEvent) => {
            const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100)
            newProgress[file.name] = percentage
            setProgress({...newProgress})
          }
        )

        const preview: UploadPreview = {
          file,
          previewUrl: URL.createObjectURL(file),
          title: file.name.split('.')[0],
          year: new Date().getFullYear(),
          progress: 100,
          url: uploadResult.url
        }
        
        setUploads(prev => [...prev, preview])
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Er ging iets mis bij het uploaden')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeUpload = (index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index))
  }

  const updateUpload = (index: number, data: Partial<UploadPreview>) => {
    setUploads(prev => prev.map((upload, i) => 
      i === index ? { ...upload, ...data } : upload
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { data: existingPhotos } = await supabase
        .from('photos')
        .select('order_number')
        .order('order_number', { ascending: false })
        .limit(1)

      const startOrderNumber = (existingPhotos?.[0]?.order_number || 0) + 1

      for (let i = 0; i < uploads.length; i++) {
        const upload = uploads[i]
        
        try {
          const result = await uploadToCloudinary(
            upload.file,
            (progressEvent) => {
              const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100)
              updateUpload(i, { progress: percentage })
            }
          )
          
          const photoData: PhotoInsert = {
            url: result.secure_url,
            thumbnail_url: result.secure_url,
            alt: upload.title,
            visible: true,
            order_number: startOrderNumber + i
          }

          const { error: dbError } = await supabase
            .from('photos')
            .insert(photoData)

          if (dbError) throw dbError

        } catch (err) {
          updateUpload(i, { 
            error: err instanceof Error ? err.message : 'Upload mislukt' 
          })
        }
      }

      onComplete()
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-screen-safe sm:max-w-lg max-h-[90vh] overflow-hidden animate-fadeIn">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
          <H3>Foto's Toevoegen</H3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFilesSelected}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100"
            />
            <SmallText>
              Maximaal 5MB per foto, alleen afbeeldingen toegestaan
            </SmallText>
          </div>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto">
            {uploads.map((upload, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={upload.previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={upload.title}
                      onChange={(e) => updateUpload(index, { title: e.target.value })}
                      className="block w-full input-primary mb-2"
                      placeholder="Titel"
                      required
                    />
                    <input
                      type="number"
                      value={upload.year}
                      onChange={(e) => updateUpload(index, { year: parseInt(e.target.value) })}
                      className="block w-full input-primary"
                      min={1900}
                      max={new Date().getFullYear()}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeUpload(index)}
                    className="p-1 text-gray-400 hover:text-gray-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {upload.progress > 0 && upload.progress < 100 && (
                  <div className="mt-2">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-primary-100">
                      <div
                        style={{ width: `${upload.progress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-300"
                      />
                    </div>
                  </div>
                )}
                {upload.error && (
                  <ErrorText className="mt-2">{upload.error}</ErrorText>
                )}
              </div>
            ))}
          </div>

          {error && <ErrorText>{error}</ErrorText>}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
              disabled={isSubmitting}
            >
              Annuleren
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploads.length === 0}
              className="btn-primary"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Bezig met uploaden...
                </div>
              ) : (
                `${uploads.length} foto's toevoegen`
              )}
            </button>
          </div>
        </form>

        {isUploading && Object.keys(progress).length > 0 && (
          <div className="mt-2 space-y-2">
            {Object.entries(progress).map(([filename, percentage]) => (
              <div key={filename} className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-700">{filename}</span>
                  <span className="text-gray-500">{percentage}%</span>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-100">
                  <div
                    style={{ width: `${percentage}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-300"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 