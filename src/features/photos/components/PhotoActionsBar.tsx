import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { Z_INDEX } from '../../../constants/zIndex'
import { cc } from '../../../styles/shared'
import type { AlbumWithDetails } from '../../albums/types'
import { useBulkDeletePhotos, useBulkUpdatePhotoVisibility, useBulkAddPhotosToAlbum, useAlbums } from '../hooks/usePhotos'
import { TrashIcon, EyeIcon, EyeSlashIcon, FolderIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface PhotoActionsBarProps {
  selectedPhotoIds: Set<string>
  onClearSelection: () => void
  setError: (error: Error | null) => void
  albums?: AlbumWithDetails[]
}

export function PhotoActionsBar({
  selectedPhotoIds,
  onClearSelection,
  setError,
  albums: propAlbums
}: PhotoActionsBarProps) {
  const [showAlbumDialog, setShowAlbumDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>('')

  const selectedCount = selectedPhotoIds.size
  const photoIds = Array.from(selectedPhotoIds)

  // Use React Query hooks
  const bulkDeleteMutation = useBulkDeletePhotos()
  const bulkVisibilityMutation = useBulkUpdatePhotoVisibility()
  const bulkAddToAlbumMutation = useBulkAddPhotosToAlbum()
  const { data: albums = propAlbums || [] } = useAlbums()

  const handleBulkDelete = async () => {
    try {
      await bulkDeleteMutation.mutateAsync(photoIds)
      onClearSelection()
      setShowDeleteDialog(false)
    } catch (err) {
      console.error('Bulk delete error:', err)
      setError(new Error('Fout bij bulk verwijderen van foto\'s'))
    }
  }

  const handleBulkVisibility = async (visible: boolean) => {
    try {
      await bulkVisibilityMutation.mutateAsync({ photoIds, visible })
      onClearSelection()
    } catch (err) {
      console.error('Bulk visibility error:', err)
      setError(new Error('Fout bij wijzigen zichtbaarheid'))
    }
  }

  const handleBulkAddToAlbum = async () => {
    if (!selectedAlbumId) return

    try {
      await bulkAddToAlbumMutation.mutateAsync({ photoIds, albumId: selectedAlbumId })
      onClearSelection()
      setShowAlbumDialog(false)
      setSelectedAlbumId('')
    } catch (err) {
      console.error('Bulk add to album error:', err)
      setError(new Error('Fout bij toevoegen aan album'))
    }
  }

  const isProcessing = bulkDeleteMutation.isPending ||
                      bulkVisibilityMutation.isPending ||
                      bulkAddToAlbumMutation.isPending

  if (selectedCount === 0) return null

  return (
    <>
      <div className="sticky top-0 z-10 bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded-md px-4 py-2 flex items-center justify-between shadow-sm">
        <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
          {selectedCount} foto{selectedCount !== 1 ? 's' : ''} geselecteerd
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAlbumDialog(true)}
            className={cc.button.base({ color: 'secondary', size: 'sm' })}
            title="Voeg toe aan album"
          >
            <FolderIcon className="w-4 h-4 mr-1" />
            Album
          </button>
          <button
            onClick={() => handleBulkVisibility(true)}
            disabled={isProcessing}
            className={cc.button.base({ color: 'secondary', size: 'sm' })}
            title="Maak zichtbaar"
          >
            <EyeIcon className="w-4 h-4 mr-1" />
            Toon
          </button>
          <button
            onClick={() => handleBulkVisibility(false)}
            disabled={isProcessing}
            className={cc.button.base({ color: 'secondary', size: 'sm' })}
            title="Maak verborgen"
          >
            <EyeSlashIcon className="w-4 h-4 mr-1" />
            Verberg
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className={cc.button.base({ color: 'danger', size: 'sm' })}
            title="Verwijder geselecteerde foto's"
          >
            <TrashIcon className="w-4 h-4 mr-1" />
            Verwijder
          </button>
          <button
            onClick={onClearSelection}
            className={cc.button.base({ color: 'secondary', size: 'sm' })}
            title="Deselecteer alle"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add to Album Dialog */}
      <Dialog open={showAlbumDialog} onClose={() => !isProcessing && setShowAlbumDialog(false)} className={`relative z-[${Z_INDEX.BASE_MODAL}]`}>
        <div className={`fixed inset-0 bg-black/30 dark:bg-black/70 z-[${Z_INDEX.BASE_MODAL}]`} aria-hidden="true" />
        <div className={`fixed inset-0 flex items-center justify-center p-4 z-[${Z_INDEX.BASE_MODAL}]`}>
          <Dialog.Panel className={cc.card({ className: "max-w-md" })}>
            <div className="p-4 sm:p-6">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                Voeg {selectedCount} foto{selectedCount !== 1 ? 's' : ''} toe aan album
              </Dialog.Title>
              <div className="mt-4">
                <label htmlFor="album-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selecteer album
                </label>
                <select
                  id="album-select"
                  value={selectedAlbumId}
                  onChange={(e) => setSelectedAlbumId(e.target.value)}
                  className={cc.form.input()}
                >
                  <option value="">Kies een album...</option>
                  {albums.map(album => (
                    <option key={album.id} value={album.id}>
                      {album.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                onClick={handleBulkAddToAlbum}
                disabled={!selectedAlbumId || isProcessing}
                className={cc.button.base({ color: 'primary', className: 'w-full sm:ml-3 sm:w-auto disabled:opacity-50' })}
              >
                {isProcessing ? 'Bezig...' : 'Toevoegen'}
              </button>
              <button
                onClick={() => setShowAlbumDialog(false)}
                disabled={isProcessing}
                className={cc.button.base({ color: 'secondary', className: 'mt-3 w-full sm:mt-0 sm:w-auto' })}
              >
                Annuleren
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => !isProcessing && setShowDeleteDialog(false)} className={`relative z-[${Z_INDEX.BASE_MODAL}]`}>
        <div className={`fixed inset-0 bg-black/30 dark:bg-black/70 z-[${Z_INDEX.BASE_MODAL}]`} aria-hidden="true" />
        <div className={`fixed inset-0 flex items-center justify-center p-4 z-[${Z_INDEX.BASE_MODAL}]`}>
          <Dialog.Panel className={cc.card({ className: "max-w-md" })}>
            <div className="p-4 sm:p-6">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                Foto's Verwijderen
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Weet je zeker dat je {selectedCount} geselecteerde foto{selectedCount !== 1 ? 's' : ''} wilt verwijderen?
                  Dit kan niet ongedaan worden gemaakt.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                onClick={handleBulkDelete}
                disabled={isProcessing}
                className={cc.button.base({ color: 'danger', className: 'w-full sm:ml-3 sm:w-auto' })}
              >
                {isProcessing ? 'Bezig...' : 'Verwijderen'}
              </button>
              <button
                onClick={() => setShowDeleteDialog(false)}
                disabled={isProcessing}
                className={cc.button.base({ color: 'secondary', className: 'mt-3 w-full sm:mt-0 sm:w-auto' })}
              >
                Annuleren
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
}