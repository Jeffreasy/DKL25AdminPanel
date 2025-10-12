import { useState, useRef, useMemo } from 'react'
import { ImageUploadClient } from '../api/client'

/**
 * Configuration for image upload hook
 */
export interface ImageUploadConfig {
  maxSizeMB?: number
  allowedTypes?: string[]
  apiBaseUrl?: string
  authToken?: string
}

/**
 * Return type for useImageUpload hook
 */
export interface ImageUploadResult {
  file: File | null
  files: File[]
  previewUrl: string | null
  previewUrls: string[]
  error: string | null
  isUploading: boolean
  progress: number
  fileInputRef: React.RefObject<HTMLInputElement>
  batchInputRef: React.RefObject<HTMLInputElement>
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleBatchFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  clearFile: () => void
  clearFiles: () => void
  uploadFile: () => Promise<string | null>
  uploadBatch: (mode?: 'parallel' | 'sequential') => Promise<string[] | null>
  setPreviewUrl: (url: string | null) => void
}

/**
 * Reusable hook for image upload functionality
 * Handles file validation, preview generation, and upload using ImageUploadClient
 *
 * @example
 * const { previewUrl, handleFileChange, uploadFile, error } = useImageUpload({
 *   maxSizeMB: 2,
 *   apiBaseUrl: '/api',
 *   authToken: 'jwt-token'
 * })
 */
export function useImageUpload(config: ImageUploadConfig = {}): ImageUploadResult {
  const {
    maxSizeMB = 2,
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    apiBaseUrl = '/api',
    authToken
  } = config

  const [file, setFile] = useState<File | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const batchInputRef = useRef<HTMLInputElement>(null)

  const client = useMemo(() => {
    if (!authToken) return null
    return new ImageUploadClient({
      authToken,
      apiBaseUrl,
      maxFileSize: maxSizeMB * 1024 * 1024,
      allowedTypes
    })
  }, [authToken, apiBaseUrl, maxSizeMB, allowedTypes])

  /**
   * Handle single file selection and validation
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
   * Handle batch file selection and validation
   */
  const handleBatchFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    // Reset error
    setError(null)

    // Validate files
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    const validFiles: File[] = []
    const validPreviewUrls: string[] = []

    for (const selectedFile of selectedFiles) {
      if (selectedFile.size > maxSizeBytes) {
        setError(`Bestand ${selectedFile.name} is te groot (max ${maxSizeMB}MB)`)
        return
      }

      if (!allowedTypes.includes(selectedFile.type)) {
        const allowedExtensions = allowedTypes
          .map(type => type.split('/')[1].toUpperCase())
          .join(', ')
        setError(`Bestand ${selectedFile.name}: alleen ${allowedExtensions} toegestaan`)
        return
      }

      validFiles.push(selectedFile)

      // Generate preview
      const reader = new FileReader()
      reader.onloadend = () => {
        validPreviewUrls.push(reader.result as string)
        if (validPreviewUrls.length === validFiles.length) {
          setPreviewUrls(validPreviewUrls)
        }
      }
      reader.readAsDataURL(selectedFile)
    }

    setFiles(validFiles)
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
   * Clear selected files and previews
   */
  const clearFiles = () => {
    setFiles([])
    setPreviewUrls([])
    setError(null)
    if (batchInputRef.current) {
      batchInputRef.current.value = ''
    }
  }

  /**
   * Upload single file using ImageUploadClient
   * Returns the uploaded file URL or null on error
   */
  const uploadFile = async (): Promise<string | null> => {
    if (!file) {
      setError('Geen bestand geselecteerd')
      return null
    }

    if (!client) {
      setError('Upload client niet geconfigureerd')
      return null
    }

    setIsUploading(true)
    setProgress(0)
    setError(null)

    try {
      const result = await client.uploadImage(file, {
        onProgress: setProgress
      })
      return result.data.secure_url
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload mislukt. Probeer het opnieuw.')
      return null
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }

  /**
   * Upload batch files using ImageUploadClient
   * Returns array of uploaded file URLs or null on error
   */
  const uploadBatch = async (mode: 'parallel' | 'sequential' = 'parallel'): Promise<string[] | null> => {
    if (files.length === 0) {
      setError('Geen bestanden geselecteerd')
      return null
    }

    if (!client) {
      setError('Upload client niet geconfigureerd')
      return null
    }

    setIsUploading(true)
    setProgress(0)
    setError(null)

    try {
      const uploadMethod = mode === 'sequential' ? 'uploadBatchImagesSequential' : 'uploadBatchImages'
      const result = await client[uploadMethod](files, {
        onProgress: setProgress
      })
      return result.data.map(item => item.secure_url)
    } catch (err) {
      console.error('Batch upload error:', err)
      setError(err instanceof Error ? err.message : 'Batch upload mislukt. Probeer het opnieuw.')
      return null
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }

  return {
    file,
    files,
    previewUrl,
    previewUrls,
    error,
    isUploading,
    progress,
    fileInputRef,
    batchInputRef,
    handleFileChange,
    handleBatchFileChange,
    clearFile,
    clearFiles,
    uploadFile,
    uploadBatch,
    setPreviewUrl
  }
}