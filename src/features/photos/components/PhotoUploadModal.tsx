import { useState, useRef } from 'react'
import { uploadToCloudinary } from '../../../lib/cloudinary/cloudinaryClient'
import { supabase } from '../../../lib/supabase'

interface PhotoUploadModalProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
}

export function PhotoUploadModal({ open, onClose, onComplete }: PhotoUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      // Valideer bestandsgrootte
      const invalidFiles = Array.from(files).filter(file => file.size > 5 * 1024 * 1024)
      if (invalidFiles.length > 0) {
        setError('Een of meer bestanden zijn groter dan 5MB')
        return
      }
      setSelectedFiles(files)
      setError(null)
    }
  }

  const handleUpload = async (files: FileList) => {
    try {
      setIsUploading(true)
      setError(null)

      // Get last order number
      const { data: lastPhoto } = await supabase
        .from('photos')
        .select('order_number')
        .order('order_number', { ascending: false })
        .limit(1)
        .single()

      let orderNumber = (lastPhoto?.order_number || 0) + 1

      // Upload all files
      for (const file of Array.from(files)) {
        try {
          const result = await uploadToCloudinary(file)
          
          // Create thumbnail URL
          const thumbnailUrl = result.secure_url.replace('/upload/', '/upload/c_thumb,w_200,g_face/')

          // Save to Supabase
          await supabase.from('photos').insert([{
            url: result.secure_url,
            thumbnail_url: thumbnailUrl,
            title: file.name.split('.')[0],
            alt: file.name.split('.')[0],
            visible: true,
            order_number: orderNumber++,
            year: new Date().getFullYear()
          }])
        } catch (err) {
          console.error(`Error uploading ${file.name}:`, err)
          throw err
        }
      }

      onComplete() // Dit triggert nu een refresh
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload mislukt')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFiles?.length) {
      setError('Selecteer eerst foto\'s')
      return
    }

    await handleUpload(selectedFiles)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Foto's Toevoegen</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <span className="sr-only">Sluiten</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecteer foto's
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Upload foto's</span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">of sleep ze hierheen</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Maximaal 5MB per foto
                  </p>
                </div>
              </div>
            </div>

            {selectedFiles && selectedFiles.length > 0 && (
              <div className="text-sm text-gray-500">
                {selectedFiles.length} foto's geselecteerd
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={isUploading || !selectedFiles?.length}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploaden...
                  </div>
                ) : (
                  "Foto's toevoegen"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
} 