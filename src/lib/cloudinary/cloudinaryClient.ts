const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

interface UploadResponse {
  url: string
  secure_url: string
}

export async function uploadToCloudinary(
  file: File,
  onProgress: (progress: number) => void
): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  const xhr = new XMLHttpRequest()
  
  return new Promise((resolve, reject) => {
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100)
        onProgress(progress)
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
        reject(new Error('Upload failed'))
      }
    }

    xhr.onerror = () => reject(new Error('Upload failed'))

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`)
    xhr.send(formData)
  })
} 