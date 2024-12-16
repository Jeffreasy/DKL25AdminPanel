import { useState } from 'react'
import { H1, SmallText } from '../components/typography'
import { PhotoGrid, PhotoUploadModal } from '../features/photos/components'

export function PhotoManagementPage() {
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <H1 className="mb-1">Foto's</H1>
            <SmallText>
              Beheer de foto's van de Koninklijke Loop
            </SmallText>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="hidden sm:inline">Foto's Toevoegen</span>
            <span className="sm:hidden">Toevoegen</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg">
        <PhotoGrid />
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <PhotoUploadModal
          onClose={() => setShowUpload(false)}
          onComplete={() => {
            setShowUpload(false)
            // Hier kunnen we de grid refreshen
          }}
        />
      )}
    </div>
  )
} 