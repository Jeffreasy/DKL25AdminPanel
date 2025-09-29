import { useState } from 'react'
import type { Photo } from '../types'
import type { AlbumWithDetails } from '../../albums/types'
import { cc } from '../../../styles/shared'
import { LoadingSkeleton } from '../../../components/LoadingSkeleton'
import { TrashIcon, PencilIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { PhotoDetailsModal } from './PhotoDetailsModal'
import { deletePhoto, updatePhotoVisibility } from '../services/photoService'
import { Dialog } from '@headlessui/react'
import { Z_INDEX } from '../../../constants/zIndex'

// Interface similar to PhotoGridProps
interface PhotoListProps {
  photos: Photo[]
  loading: boolean
  error: Error | null
  onUpdate: () => Promise<void>
  setError: (error: Error | null) => void
  albums?: AlbumWithDetails[]
  selectedPhotoIds: Set<string>
  onSelectionChange: (photoId: string, isSelected: boolean) => void
  onSelectAll: (photoIds: string[]) => void // Add select all handler prop
}

export function PhotoList({ 
  photos, 
  loading, 
  error, 
  onUpdate, 
  setError, 
  albums, 
  selectedPhotoIds, 
  onSelectionChange,
  onSelectAll
}: PhotoListProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null) // For details modal
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null) // For delete confirmation

  const allVisiblePhotoIds = photos.map(p => p.id);
  const areAllSelected = allVisiblePhotoIds.length > 0 && allVisiblePhotoIds.every(id => selectedPhotoIds.has(id));

  const handleError = (message: string) => {
    setError(new Error(message))
  }

  const handleDelete = async (photo: Photo | null) => {
    if (!photo) return;
    try {
      await deletePhoto(photo.id);
      setPhotoToDelete(null);
      await onUpdate();
    } catch (err) {
      console.error("Error deleting photo:", err);
      handleError('Er ging iets mis bij het verwijderen van de foto');
      setPhotoToDelete(null);
    }
  }

  const handleVisibilityToggle = async (photo: Photo | null) => {
    if (!photo) return;
    try {
      await updatePhotoVisibility(photo.id, !photo.visible);
      await onUpdate();
    } catch (_err) {
      console.error("Error toggling visibility:", _err);
      handleError('Kon zichtbaarheid niet wijzigen');
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <LoadingSkeleton key={i} className="h-16 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400 text-center py-8">{error.message}</div>
  }

  if (photos.length === 0) {
    return <div className="text-gray-500 dark:text-gray-400 text-center py-8">Geen foto's gevonden.</div>
  }

  return (
    <>
      <div className="overflow-x-auto align-middle inline-block min-w-full">
        <div className={cc.card({ className: 'shadow overflow-hidden p-0' })}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="pl-4 pr-2 py-3 text-left">
                   <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-700 mr-2"
                    checked={areAllSelected}
                    onChange={() => onSelectAll(allVisiblePhotoIds)}
                    aria-label="Selecteer alle foto's"
                  />
                </th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Foto
                </th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Titel
                </th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  Toegevoegd
                </th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  Albums
                </th>
                <th scope="col" className="relative pl-2 pr-4 py-3">
                  <span className="sr-only">Acties</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {photos.map((photo) => {
                const isSelected = selectedPhotoIds.has(photo.id);
                const photoAlbums = photo.album_photos?.map(({ album_id }) => albums?.find(a => a.id === album_id)).filter(Boolean);

                return (
                  <tr key={photo.id} className={`${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''} hover:bg-gray-50 dark:hover:bg-gray-800/50`}>
                    <td className="pl-4 pr-2 py-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-gray-700"
                        checked={isSelected}
                        onChange={(e) => onSelectionChange(photo.id, e.target.checked)}
                      />
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <img 
                        src={photo.thumbnail_url || photo.url}
                        alt={photo.alt_text || photo.title}
                        className="h-10 w-10 rounded object-cover"
                        loading="lazy"
                      />
                    </td>
                    <td className="px-2 py-2 text-sm font-medium text-gray-900 dark:text-white max-w-[150px]">
                      {photo.title}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                      {formatDate(photo.created_at)}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap">
                      <span className={cc.badge({ color: photo.visible ? 'green' : 'gray' })}>
                        {photo.visible ? 'Zichtbaar' : 'Verborgen'}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400 max-w-xs hidden sm:table-cell">
                      {photoAlbums && photoAlbums.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {photoAlbums.slice(0, 2).map(album => (
                            <span key={album?.id} className={cc.badge({ color: 'gray' })} title={album?.title}>{album?.title}</span>
                          ))}
                          {photoAlbums.length > 2 && (
                             <span className={cc.badge({ color: 'gray' })}>+{photoAlbums.length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="pl-2 pr-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex flex-col items-end space-y-1">
                        <button
                          onClick={() => handleVisibilityToggle(photo)}
                          className={cc.button.icon({ color: 'secondary' })}
                          title={photo.visible ? 'Verberg foto' : 'Maak foto zichtbaar'} 
                        >
                          {photo.visible ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                        </button>
                        <div className="flex items-center justify-end gap-1">
                           <button
                            onClick={() => setSelectedPhoto(photo)}
                            className={cc.button.icon({ color: 'secondary' })}
                            title="Bekijk / Bewerk details" 
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPhotoToDelete(photo)}
                            className={cc.button.icon({ color: 'danger' })}
                            title="Verwijder foto" 
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals (reused from PhotoGrid or specific ones can be added) */}
      {selectedPhoto && (
        <PhotoDetailsModal 
          photo={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)} 
          onUpdate={async () => { await onUpdate(); setSelectedPhoto(null); }} 
          albums={albums}
        />
      )}
      {photoToDelete && (
        <Dialog open={!!photoToDelete} onClose={() => setPhotoToDelete(null)} className={`relative z-[${Z_INDEX.PHOTO_SELECTOR + 1}]`}>
          {/* ... Delete Confirmation Modal Content (same as in PhotoGrid) ... */}
          <div className={`fixed inset-0 bg-black/30 dark:bg-black/70 z-[${Z_INDEX.PHOTO_SELECTOR + 1}]`} aria-hidden="true" />
          <div className={`fixed inset-0 flex items-center justify-center p-4 z-[${Z_INDEX.PHOTO_SELECTOR + 1}]`}>
            {photoToDelete && (
              <Dialog.Panel className={cc.card({ className: "max-w-md" })}>
                <div className="p-4 sm:p-6">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Foto Verwijderen
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Weet je zeker dat je de foto "{photoToDelete.title}" wilt verwijderen?
                      Dit kan niet ongedaan worden gemaakt.
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button onClick={() => handleDelete(photoToDelete)} className={cc.button.base({ color: 'danger', className: 'w-full sm:ml-3 sm:w-auto' })}>
                    Verwijderen
                  </button>
                  <button onClick={() => setPhotoToDelete(null)} className={cc.button.base({ color: 'secondary', className: 'mt-3 w-full sm:mt-0 sm:w-auto' })}>
                    Annuleren
                  </button>
                </div>
              </Dialog.Panel>
            )}
          </div>
        </Dialog>
      )}
    </>
  )
} 