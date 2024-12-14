import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { supabase } from '../../../lib/supabase/supabaseClient'

interface BulkUploadButtonProps {
  onUploadComplete: () => void
}

export function BulkUploadButton({ onUploadComplete }: BulkUploadButtonProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = useCallback(async (files: File[]) => {
    setUploading(true)
    setError(null)

    try {
      for (const file of files) {
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
          throw new Error('Alleen afbeeldingen zijn toegestaan')
        }

        // Upload to Cloudinary
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'dkl25_photos')

        const response = await fetch(
          'https://api.cloudinary.com/v1_1/dgfuv7wif/image/upload',
          {
            method: 'POST',
            body: formData
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Upload naar Cloudinary mislukt')
        }

        // Save to Supabase
        const { error: dbError } = await supabase
          .from('photos')
          .insert([
            {
              url: data.secure_url,
              alt: file.name.split('.')[0],
              visible: true,
              order_number: 9999  // Will be reordered by drag & drop
            }
          ])

        if (dbError) throw dbError
      }

      onUploadComplete()
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload mislukt')
    } finally {
      setUploading(false)
    }
  }, [onUploadComplete])

  // Dropzone setup
  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleFiles(acceptedFiles)
  }, [handleFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    }
  })

  // Paste handler
  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    const files: File[] = []
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) files.push(file)
      }
    }

    if (files.length > 0) {
      e.preventDefault()
      handleFiles(files)
    }
  }, [handleFiles])

  // Add paste event listener using useEffect
  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive 
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' 
            : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <div className="text-gray-600 dark:text-gray-400">
            {uploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mr-2" />
                <span>Uploading...</span>
              </div>
            ) : isDragActive ? (
              <span>Drop de foto's hier...</span>
            ) : (
              <>
                <p>Sleep foto's hierheen of klik om te uploaden</p>
                <p className="text-sm">Je kunt ook foto's plakken (Ctrl+V)</p>
              </>
            )}
          </div>
          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 