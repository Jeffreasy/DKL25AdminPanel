import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '../../../lib/supabase/supabaseClient'

interface BulkUploadButtonProps {
  onUploadComplete: () => void
  className?: string
}

export function BulkUploadButton({ onUploadComplete, className = '' }: BulkUploadButtonProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    disabled: uploading,
    maxFiles: 20, // Maximum aantal files per keer
    maxSize: 5242880, // 5MB max per file
    onDrop: async (acceptedFiles) => {
      setUploading(true)
      setProgress(0)
      setError(null)

      try {
        // Haal het huidige hoogste order_number op
        const { data: photos } = await supabase
          .from('photos')
          .select('order_number')
          .order('order_number', { ascending: false })
          .limit(1)

        const startOrderNumber = (photos?.[0]?.order_number || 0) + 1
        const totalFiles = acceptedFiles.length
        let completed = 0

        // Upload files in parallel with progress tracking
        const uploadPromises = acceptedFiles.map(async (file, index) => {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
              method: 'POST',
              body: formData,
            }
          )

          if (!response.ok) throw new Error('Upload failed')
          
          const cloudinaryData = await response.json()

          // Voeg de foto toe aan Supabase
          const { error: dbError } = await supabase
            .from('photos')
            .insert({
              url: cloudinaryData.secure_url,
              alt: `DKL 2024 foto ${startOrderNumber + index}`,
              order_number: startOrderNumber + index,
            })

          if (dbError) throw dbError

          completed++
          setProgress((completed / totalFiles) * 100)
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
          p-3 rounded-full
          ${isDragActive ? 'bg-indigo-100' : 'bg-gray-100'}
          ${isDragReject ? 'bg-red-100' : ''}
        `}>
          <svg 
            className={`w-6 h-6 ${isDragActive ? 'text-indigo-600' : 'text-gray-600'} ${isDragReject ? 'text-red-600' : ''}`}
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        {/* Status Text */}
        <div className="text-center">
          {isDragReject ? (
            <p className="text-sm text-red-600">
              Alleen afbeeldingen zijn toegestaan
            </p>
          ) : isDragActive ? (
            <p className="text-sm text-indigo-600">
              Sleep de foto's hier...
            </p>
          ) : (
            <div>
              <p className="text-sm text-gray-600">
                Sleep foto's hierheen of{' '}
                <span className="text-indigo-600 hover:text-indigo-700">
                  klik om te selecteren
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG of WebP (max 5MB per foto)
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full">
            {error}
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Uploading...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 