import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadToCloudinary } from '../../../../lib/cloudinary/cloudinaryClient'
import { supabase } from '../../../../lib/supabase'
import type { CloudinaryUploadResponse } from '../../../../lib/cloudinary/types'

interface BulkUploadButtonProps {
  onUploadComplete: () => void
  targetYear: string
  className?: string
  maxFiles?: number
  maxFileSize?: number
}

const savePhotoToAPI = async (params: {
  url: string
  alt_text: string
  order_number: number
  year: string
  thumbnail_url?: string
}): Promise<void> => {
  const { error } = await supabase
    .from('photos')
    .insert([{
      url: params.url,
      alt_text: params.alt_text,
      thumbnail_url: params.thumbnail_url || params.url,
      order_number: params.order_number,
      visible: true,
      year: params.year
    }])

  if (error) throw error
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

export function BulkUploadButton({ onUploadComplete, targetYear, className = '', maxFiles = 20, maxFileSize = 5242880 }: BulkUploadButtonProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<{[key: string]: number}>({})
  const [error, setError] = useState<string | null>(null)

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    disabled: uploading,
    maxFiles: maxFiles,
    maxSize: maxFileSize,
    onDrop: async (acceptedFiles) => {
      setUploading(true)
      setProgress({})
      setError(null)

      if (!targetYear) {
        setError('Doeljaar niet opgegeven voor bulk upload.')
        setUploading(false)
        return
      }

      try {
        const startOrderNumber = await getLastOrderNumber()

        for (let i = 0; i < acceptedFiles.length; i += 3) {
          const batch = acceptedFiles.slice(i, i + 3)
          await Promise.all(batch.map(async (file, index) => {
            try {
              const result: CloudinaryUploadResponse = await uploadToCloudinary(
                file,
                (progressEvent) => {
                  setProgress(prev => ({
                    ...prev,
                    [file.name]: Math.round((progressEvent.loaded / progressEvent.total) * 100)
                  }))
                }
              )

              await savePhotoToAPI({
                url: result.secure_url,
                thumbnail_url: result.secure_url,
                alt_text: file.name.split('.')[0],
                order_number: startOrderNumber + i + index,
                year: targetYear
              })
            } catch (err) {
              console.error(`Error uploading ${file.name}:`, err)
              throw err
            }
          }))
        }

        onUploadComplete()
      } catch (err) {
        console.error('Upload error:', err)
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
        setProgress({})
      }
    }
  })

  // Bereken totale voortgang
  const totalProgress = Object.values(progress).reduce((sum, value) => sum + value, 0) / 
    (Object.keys(progress).length || 1)

  return (
    <div
      {...getRootProps()}
      className={`
        relative p-4 border-2 border-dashed rounded-lg transition-all
        ${isDragActive 
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
          : 'border-gray-300 dark:border-gray-600'}
        ${isDragReject 
          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
          : ''}
        ${uploading 
          ? 'opacity-75 cursor-not-allowed' 
          : 'cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600'}
        ${className}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center space-y-3">
        {/* Upload Icon */}
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center
          ${uploading ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-indigo-50 dark:bg-indigo-900/20'}
        `}>
          <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        {/* Status Text met gedetailleerde voortgang */}
        <div className="text-sm text-center">
          {uploading ? (
            <div className="space-y-2">
              <div className="text-indigo-600 dark:text-indigo-400">
                Uploading... {Math.round(totalProgress)}%
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all"
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
            </div>
          ) : isDragActive ? (
            <div className="text-indigo-600 dark:text-indigo-400">
              Drop de bestanden hier...
            </div>
          ) : (
            <div className="text-gray-600 dark:text-gray-400">
              Sleep foto's hierheen of klik om te uploaden
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Max {maxFiles} bestanden, {(maxFileSize / (1024 * 1024)).toFixed(1)}MB per bestand
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  )
} 