import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useImageUpload } from '../useImageUpload'

// Mock FileReader
class MockFileReader {
  result: string | ArrayBuffer | null = null
  onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null

  readAsDataURL(file: Blob) {
    setTimeout(() => {
      this.result = 'data:image/png;base64,mockbase64data'
      if (this.onloadend) {
        this.onloadend.call(this as any, {} as any)
      }
    }, 0)
  }
}

global.FileReader = MockFileReader as any

describe('useImageUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('initializes with default values', () => {
      const { result } = renderHook(() => useImageUpload())

      expect(result.current.file).toBeNull()
      expect(result.current.previewUrl).toBeNull()
      expect(result.current.error).toBeNull()
      expect(result.current.isUploading).toBe(false)
      expect(result.current.fileInputRef.current).toBeNull()
    })

    it('accepts custom configuration', () => {
      const uploadFunction = vi.fn()
      const { result } = renderHook(() =>
        useImageUpload({
          maxSizeMB: 5,
          allowedTypes: ['image/png'],
          uploadFunction,
        })
      )

      expect(result.current.file).toBeNull()
    })
  })

  describe('File Selection', () => {
    it('handles valid file selection', async () => {
      const { result } = renderHook(() => useImageUpload())

      const file = new File(['content'], 'test.png', { type: 'image/png' })
      const event = {
        target: {
          files: [file],
        },
      } as any

      act(() => {
        result.current.handleFileChange(event)
      })

      await waitFor(() => {
        expect(result.current.file).toBe(file)
        expect(result.current.previewUrl).toBe('data:image/png;base64,mockbase64data')
        expect(result.current.error).toBeNull()
      })
    })

    it('rejects file exceeding size limit', () => {
      const { result } = renderHook(() =>
        useImageUpload({ maxSizeMB: 1 })
      )

      // Create a file larger than 1MB
      const largeContent = new Array(2 * 1024 * 1024).fill('a').join('')
      const file = new File([largeContent], 'large.png', { type: 'image/png' })
      const event = {
        target: {
          files: [file],
        },
      } as any

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(result.current.error).toBe('Bestand mag niet groter zijn dan 1MB')
      expect(result.current.file).toBeNull()
    })

    it('rejects invalid file type', () => {
      const { result } = renderHook(() =>
        useImageUpload({
          allowedTypes: ['image/png', 'image/jpeg'],
        })
      )

      const file = new File(['content'], 'test.gif', { type: 'image/gif' })
      const event = {
        target: {
          files: [file],
        },
      } as any

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(result.current.error).toContain('Alleen de volgende bestandstypen zijn toegestaan')
      expect(result.current.file).toBeNull()
    })

    it('handles no file selected', () => {
      const { result } = renderHook(() => useImageUpload())

      const event = {
        target: {
          files: [],
        },
      } as any

      act(() => {
        result.current.handleFileChange(event)
      })

      expect(result.current.file).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('resets error on new file selection', async () => {
      const { result } = renderHook(() => useImageUpload({ maxSizeMB: 1 }))

      // First, trigger an error
      const largeFile = new File([new Array(2 * 1024 * 1024).fill('a').join('')], 'large.png', {
        type: 'image/png',
      })
      act(() => {
        result.current.handleFileChange({
          target: { files: [largeFile] },
        } as any)
      })

      expect(result.current.error).toBeTruthy()

      // Then select a valid file
      const validFile = new File(['content'], 'test.png', { type: 'image/png' })
      act(() => {
        result.current.handleFileChange({
          target: { files: [validFile] },
        } as any)
      })

      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })
    })
  })

  describe('Clear File', () => {
    it('clears file and preview', async () => {
      const { result } = renderHook(() => useImageUpload())

      const file = new File(['content'], 'test.png', { type: 'image/png' })
      act(() => {
        result.current.handleFileChange({
          target: { files: [file] },
        } as any)
      })

      await waitFor(() => {
        expect(result.current.file).toBe(file)
      })

      act(() => {
        result.current.clearFile()
      })

      expect(result.current.file).toBeNull()
      expect(result.current.previewUrl).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })

  describe('Upload File', () => {
    it('uploads file successfully', async () => {
      const uploadFunction = vi.fn().mockResolvedValue({
        secure_url: 'https://example.com/image.png',
      })

      const { result } = renderHook(() =>
        useImageUpload({ uploadFunction })
      )

      const file = new File(['content'], 'test.png', { type: 'image/png' })
      act(() => {
        result.current.handleFileChange({
          target: { files: [file] },
        } as any)
      })

      await waitFor(() => {
        expect(result.current.file).toBe(file)
      })

      let uploadedUrl: string | null = null
      await act(async () => {
        uploadedUrl = await result.current.uploadFile()
      })

      expect(uploadedUrl).toBe('https://example.com/image.png')
      expect(uploadFunction).toHaveBeenCalledWith(file)
      expect(result.current.isUploading).toBe(false)
    })

    it('handles upload error', async () => {
      const uploadFunction = vi.fn().mockRejectedValue(new Error('Upload failed'))

      const { result } = renderHook(() =>
        useImageUpload({ uploadFunction })
      )

      const file = new File(['content'], 'test.png', { type: 'image/png' })
      act(() => {
        result.current.handleFileChange({
          target: { files: [file] },
        } as any)
      })

      await waitFor(() => {
        expect(result.current.file).toBe(file)
      })

      let uploadedUrl: string | null = 'initial'
      await act(async () => {
        uploadedUrl = await result.current.uploadFile()
      })

      expect(uploadedUrl).toBeNull()
      expect(result.current.error).toBe('Upload mislukt. Probeer het opnieuw.')
      expect(result.current.isUploading).toBe(false)
    })

    it('returns null when no file selected', async () => {
      const { result } = renderHook(() => useImageUpload())

      let uploadedUrl: string | null = 'initial'
      await act(async () => {
        uploadedUrl = await result.current.uploadFile()
      })

      expect(uploadedUrl).toBeNull()
      expect(result.current.error).toBe('Geen bestand geselecteerd')
    })

    it('returns null when upload function not configured', async () => {
      const { result } = renderHook(() => useImageUpload())

      const file = new File(['content'], 'test.png', { type: 'image/png' })
      act(() => {
        result.current.handleFileChange({
          target: { files: [file] },
        } as any)
      })

      await waitFor(() => {
        expect(result.current.file).toBe(file)
      })

      let uploadedUrl: string | null = 'initial'
      await act(async () => {
        uploadedUrl = await result.current.uploadFile()
      })

      expect(uploadedUrl).toBeNull()
      expect(result.current.error).toBe('Upload functie niet geconfigureerd')
    })

    it('sets isUploading during upload', async () => {
      let resolveUpload: (value: { secure_url: string }) => void
      const uploadFunction = vi.fn(
        () => new Promise<{ secure_url: string }>((resolve) => {
          resolveUpload = resolve
        })
      )

      const { result } = renderHook(() =>
        useImageUpload({ uploadFunction })
      )

      const file = new File(['content'], 'test.png', { type: 'image/png' })
      act(() => {
        result.current.handleFileChange({
          target: { files: [file] },
        } as any)
      })

      await waitFor(() => {
        expect(result.current.file).toBe(file)
      })

      // Start upload
      act(() => {
        result.current.uploadFile()
      })

      // Check isUploading is true
      await waitFor(() => {
        expect(result.current.isUploading).toBe(true)
      })

      // Resolve upload
      act(() => {
        resolveUpload!({ secure_url: 'url' })
      })

      // Check isUploading is false
      await waitFor(() => {
        expect(result.current.isUploading).toBe(false)
      })
    })
  })

  describe('Set Preview URL', () => {
    it('sets preview URL manually', async () => {
      const { result } = renderHook(() => useImageUpload())

      act(() => {
        result.current.setPreviewUrl('https://example.com/preview.png')
      })

      await waitFor(() => {
        expect(result.current.previewUrl).toBe('https://example.com/preview.png')
      })
    })

    it('clears preview URL', async () => {
      const { result } = renderHook(() => useImageUpload())

      act(() => {
        result.current.setPreviewUrl('https://example.com/preview.png')
      })

      act(() => {
        result.current.setPreviewUrl(null)
      })

      await waitFor(() => {
        expect(result.current.previewUrl).toBeNull()
      })
    })
  })

  describe('File Reader Error', () => {
    it('handles file reader error', async () => {
      // Mock FileReader with error
      class ErrorFileReader {
        result: string | ArrayBuffer | null = null
        onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null
        onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null

        readAsDataURL(file: Blob) {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror.call(this as any, {} as any)
            }
          }, 0)
        }
      }

      global.FileReader = ErrorFileReader as any

      const { result } = renderHook(() => useImageUpload())

      const file = new File(['content'], 'test.png', { type: 'image/png' })
      
      await act(async () => {
        result.current.handleFileChange({
          target: { files: [file] },
        } as any)
      })

      await waitFor(() => {
        expect(result.current.error).toBe('Kon bestand niet lezen')
      })

      // Restore original FileReader
      global.FileReader = MockFileReader as any
    })
  })
})