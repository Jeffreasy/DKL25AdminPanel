const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY

interface CloudinaryResponse {
  url: string
  secure_url: string
}

export const uploadToCloudinary = async (
  file: File, 
  onProgress?: (progress: { loaded: number; total: number }) => void
): Promise<CloudinaryResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('api_key', API_KEY)

  const xhr = new XMLHttpRequest()
  
  return new Promise((resolve, reject) => {
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({ loaded: e.loaded, total: e.total })
      }
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText)
        resolve({
          url: response.secure_url,
          secure_url: response.secure_url
        })
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText)
          reject(new Error(errorResponse.message || 'Upload failed'))
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      }
    }

    xhr.onerror = () => reject(new Error('Upload failed'))

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`)
    xhr.send(formData)
  })
} 