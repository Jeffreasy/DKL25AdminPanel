import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { Z_INDEX } from '../../../../config/zIndex'
import { cc } from '../../../../styles/shared'
import { XMarkIcon } from '@heroicons/react/24/outline'
import PhotoGalleryPreview from './PhotoGalleryPreview'
import type { PublicAlbumPreview } from '../../services/albumService'
import { fetchPublicGalleryData } from '../../services/albumService'

interface GalleryPreviewModalProps {
  open: boolean
  onClose: () => void
}

export function GalleryPreviewModal({ open, onClose }: GalleryPreviewModalProps) {
  const [galleryData, setGalleryData] = useState<PublicAlbumPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      loadGalleryData()
    }
  }, [open])

  const loadGalleryData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPublicGalleryData()
      setGalleryData(data)
    } catch (err) {
      console.error("Error fetching public gallery data:", err)
      setError("Kon galerij gegevens niet laden.")
      setGalleryData([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} className={`relative z-[${Z_INDEX.PREVIEW_MODAL}]`}>
      <div className={`fixed inset-0 bg-black/50 z-[${Z_INDEX.PREVIEW_MODAL}]`} aria-hidden="true" />
      
      <div className={`fixed inset-0 flex items-center justify-center p-4 z-[${Z_INDEX.PREVIEW_MODAL}]`}>
        <Dialog.Panel className={cc.card({ className: "w-full max-w-5xl max-h-[90vh] flex flex-col p-0"})}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
            <Dialog.Title as="h2" className="text-lg font-medium text-gray-900 dark:text-white">
              Gallerij Preview
            </Dialog.Title>
            <button
              onClick={onClose}
              className={cc.button.icon({ color: 'secondary' })}
              title="Sluiten"
            >
              <span className="sr-only">Sluiten</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 flex-grow overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
            {loading && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-10">Galerij laden...</p>
            )}
            {error && (
              <div className={`${cc.alert({ status: 'error' })} mx-auto max-w-lg`}>{error}</div>
            )}
            {!loading && !error && (
              <PhotoGalleryPreview galleryData={galleryData} />
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

// Note: You might need to add Z_INDEX.PREVIEW_MODAL to your constants/zIndex.ts file
// with a value higher than BASE_MODAL, e.g., Z_INDEX.BASE_MODAL + 10 