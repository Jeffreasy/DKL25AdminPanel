import { useState, useRef, ChangeEvent } from 'react'
import { uploadToCloudinary } from '../../../lib/cloudinary/cloudinaryClient'
import { supabase } from '../../../lib/supabase'
import { cc } from '../../../styles/shared'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface PhotoUploadModalProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
}

export function PhotoUploadModal({ open, onClose, onComplete }: PhotoUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const currentYear = String(new Date().getFullYear())
  const [selectedYear, setSelectedYear] = useState<string>(currentYear)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const availableYears = [currentYear, String(parseInt(currentYear) - 1), String(parseInt(currentYear) + 1), '2023']
  const yearOptions = [...new Set(availableYears)].sort((a, b) => parseInt(b) - parseInt(a))

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

      // Upload all files
      for (const file of Array.from(files)) {
        try {
          const result = await uploadToCloudinary(file)
          
          // Create thumbnail URL
          const thumbnailUrl = result.secure_url.replace('/upload/', '/upload/c_thumb,w_200,g_face/')

          // Save to Supabase - without order_number
          await supabase.from('photos').insert([{
            url: result.secure_url,
            thumbnail_url: thumbnailUrl,
            title: file.name.split('.')[0],
            alt_text: file.name.split('.')[0],
            visible: true,
            year: selectedYear
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
    if (!selectedYear) {
        setError('Selecteer een jaar')
        return
    }

    await handleUpload(selectedFiles)
  }

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
      <div className={cc.card({ className: 'w-full max-w-md p-0 flex flex-col max-h-[90vh]' })}>
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Foto's Toevoegen</h2>
          <button
            onClick={onClose}
            className={cc.button.icon({ color: 'secondary' })}
            title="Sluiten"
          >
            <span className="sr-only">Sluiten</span>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-grow overflow-y-auto" id="photo-upload-form">
          <div>
            <label className={cc.form.label({ className: 'mb-2' })}>Selecteer foto's</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors bg-gray-50 dark:bg-gray-700/50">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
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
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Maximaal 5MB per foto
                </p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="year-select" className={cc.form.label()}>Jaar (Map)</label>
            <select
              id="year-select"
              name="year"
              value={selectedYear}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedYear(e.target.value)}
              className={cc.form.select({ className: 'mt-1' })}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {selectedFiles && selectedFiles.length > 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {selectedFiles.length} foto{selectedFiles.length !== 1 ? '' : 's'} geselecteerd
            </div>
          )}

          {error && (
            <div className={cc.alert({ status: 'error' })}>
              <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </form>

        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className={cc.button.base({ color: 'secondary' })}
          >
            Annuleren
          </button>
          <button
            type="submit"
            form="photo-upload-form"
            disabled={isUploading || !selectedFiles?.length}
            className={cc.button.base({ color: 'primary' })}
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
    </div>
  )
} 