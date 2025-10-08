import { useState, useRef } from 'react'

/**
 * Configuration for image upload hook
 */
export interface ImageUploadConfig {
  maxSizeMB?: number
  allowedTypes?: string[]
  uploadFunction?: (file: File) => Promise<{ secure_url: string }>
}

/**
 * Return type for useImageUpload hook
 */
export interface ImageUploadResult {
  file: File | null
  previewUrl: string | null
  error: string | null
  isUploading: boolean
  fileInputRef: React.RefObject<HTMLInputElement>
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  clearFile: () => void
  uploadFile: () => Promise<string | null>
  setPreviewUrl: (url: string | null) => void
}

/**
 * Reusable hook for image upload functionality
 * Handles file validation, preview generation, and upload
 * 
 * @example
 * const { previewUrl, handleFileChange, uploadFile, error } = useImageUpload({
 *   maxSizeMB: 2,
 *   uploadFunction: uploadPartnerLogo
 * })
 */
export function useImageUpload(config: ImageUploadConfig = {}): ImageUploadResult {
  const {
    maxSizeMB = 2,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    uploadFunction
  } = config

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * Handle file selection and validation
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Reset error
    setError(null)

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (selectedFile.size > maxSizeBytes) {
      setError(`Bestand mag niet groter zijn dan ${maxSizeMB}MB`)
      return
    }

    // Validate file type
    if (!allowedTypes.includes(selectedFile.type)) {
      const allowedExtensions = allowedTypes
        .map(type => type.split('/')[1].toUpperCase())
        .join(', ')
      setError(`Alleen de volgende bestandstypen zijn toegestaan: ${allowedExtensions}`)
      return
    }

    // Set file and generate preview
    setFile(selectedFile)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.onerror = () => {
      setError('Kon bestand niet lezen')
    }
    reader.readAsDataURL(selectedFile)
  }

  /**
   * Clear selected file and preview
   */
  const clearFile = () => {
    setFile(null)
    setPreviewUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * Upload file using provided upload function
   * Returns the uploaded file URL or null on error
   */
  const uploadFile = async (): Promise<string | null> => {
    if (!file) {
      setError('Geen bestand geselecteerd')
      return null
    }

    if (!uploadFunction) {
      setError('Upload functie niet geconfigureerd')
      return null
    }

    setIsUploading(true)
    setError(null)

    try {
      const result = await uploadFunction(file)
      return result.secure_url
    } catch (err) {
      console.error('Upload error:', err)
      setError('Upload mislukt. Probeer het opnieuw.')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return {
    file,
    previewUrl,
    error,
    isUploading,
    fileInputRef,
    handleFileChange,
    clearFile,
    uploadFile,
    setPreviewUrl
  }
}