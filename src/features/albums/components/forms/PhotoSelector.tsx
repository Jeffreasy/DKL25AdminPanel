import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Z_INDEX } from '../../../../config/zIndex'
import { cc } from '../../../../styles/shared'
import { LoadingGrid } from '../../../../components/ui'
import { usePhotoSelection, useAvailablePhotos } from '../../hooks'

interface PhotoSelectorProps {
  albumId: string
  existingPhotoIds: string[]
  onComplete: (selectedPhotoIds: string[]) => Promise<void>
  onCancel: () => void
}

export function PhotoSelector({ existingPhotoIds, onComplete, onCancel }: PhotoSelectorProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const { photos: availablePhotos, loading, error } = useAvailablePhotos({
    excludePhotoIds: existingPhotoIds
  })
  
  const { selectedPhotoIds, toggleSelection } = usePhotoSelection({ multiSelect: true })

  const handleSubmit = async () => {
    if (selectedPhotoIds.length === 0) {
      setSubmitError('Selecteer eerst foto\'s om toe te voegen')
      return
    }

    await onComplete(selectedPhotoIds)
  }

  return (
    <Dialog open={true} onClose={onCancel} className={`relative z-[${Z_INDEX.PHOTO_SELECTOR}]`}>
      <div className={`fixed inset-0 ${cc.overlay.light} z-[${Z_INDEX.PHOTO_SELECTOR}]`} aria-hidden="true" />
      
      <div className={`fixed inset-0 flex items-center justify-center ${cc.spacing.container.sm} z-[${Z_INDEX.PHOTO_SELECTOR}]`}>
        <Dialog.Panel className={`relative bg-white dark:bg-gray-800 rounded-lg ${cc.spacing.container.md} max-w-4xl w-full max-h-[90vh] flex flex-col`}>
          <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Foto's toevoegen aan album
          </Dialog.Title>

          {loading ? (
            <LoadingGrid variant="compact" count={8} />
          ) : availablePhotos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Alle beschikbare foto's zijn al toegevoegd aan dit album
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className={`${cc.grid.compact()} ${cc.spacing.gap.lg}`}>
                {availablePhotos.map(photo => (
                  <button
                    key={photo.id}
                    onClick={() => toggleSelection(photo.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden group ${cc.transition.normal} ${
                      selectedPhotoIds.includes(photo.id) ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-gray-800' : ''
                    }`}
                  >
                    <img
                      src={photo.thumbnail_url || photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className={`absolute inset-0 bg-black/50 flex items-center justify-center ${cc.transition.opacity} ${
                      selectedPhotoIds.includes(photo.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {(error || submitError) && (
            <div className={`${cc.spacing.container.sm} bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800`}>
              {error || submitError}
            </div>
          )}

          <div className={`mt-4 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 ${cc.spacing.py.sm}`}>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedPhotoIds.length} foto's geselecteerd
            </span>
            <div className={`flex ${cc.spacing.gap.sm}`}>
              <button
                onClick={onCancel}
                className={cc.button.base({ color: 'secondary' })}
              >
                Annuleren
              </button>
              <button
                onClick={handleSubmit}
                disabled={selectedPhotoIds.length === 0 || loading}
                className={cc.button.base({ color: 'primary' })}
              >
                Toevoegen
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 