import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadToCloudinary } from '../../../lib/cloudinary/cloudinaryClient'

interface BulkUploadButtonProps {
  onUploadComplete: () => void
  className?: string
  maxFiles?: number
  maxFileSize?: number
}

// TODO: Vervang dit door je nieuwe API service
const savePhotoToAPI = async (params: {
  url: string
  alt: string
  order_number: number
}): Promise<void> => {
  // Implementeer je nieuwe API call hier
  console.log('Saving photo with params:', params)
}

export function BulkUploadButton({ onUploadComplete, className = '', maxFiles = 20, maxFileSize = 5242880 }: BulkUploadButtonProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
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
      setProgress(0)
      setError(null)

      try {
        // Start met order_number 1 of gebruik een API call om laatste nummer op te halen
        const startOrderNumber = 1
        const totalFiles = acceptedFiles.length
        let completed = 0

        const uploadPromises = acceptedFiles.map(async (file, index) => {
          const result = await uploadToCloudinary(
            file,
            (progressEvent) => {
              // Log progress voor debugging
              console.log('Upload progress:', progressEvent)
              completed++
              setProgress((completed / totalFiles) * 100)
            }
          )

          await savePhotoToAPI({
            url: result.secure_url,
            alt: `DKL 2024 foto ${startOrderNumber + index}`,
            order_number: startOrderNumber + index,
          })
        })

        await Promise.all(uploadPromises)
        onUploadComplete()
      } catch (err) {
        console.error('Upload error:', err)
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
        setProgress(0)
      }
    }
  })

  return (
    <div
      {...getRootProps()}
      className={`
        relative p-4 border-2 border-dashed rounded-lg transition-all duration-200
        ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}
        ${isDragReject ? 'border-red-500 bg-red-50' : ''}
        ${uploading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:border-indigo-400'}
        ${className}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center space-y-3">
        {/* Upload Icon */}
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center
          ${uploading ? 'bg-indigo-100' : 'bg-indigo-50'}
        `}>
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        {/* Status Text */}
        <div className="text-sm text-center">
          {uploading ? (
            <div className="text-indigo-600">
              Uploading... {Math.round(progress)}%
            </div>
          ) : isDragActive ? (
            <div className="text-indigo-600">
              Drop de bestanden hier...
            </div>
          ) : (
            <div className="text-gray-600">
              Sleep foto's hierheen of klik om te uploaden
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  )
} 