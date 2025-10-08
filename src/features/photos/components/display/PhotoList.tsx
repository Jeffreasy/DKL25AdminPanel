import { useState } from 'react'
import type { Photo } from '../../types'
import type { AlbumWithDetails } from '../../../albums/types'
import { cc } from '../../../../styles/shared'
import { TrashIcon, PencilIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { PhotoDetailsModal } from './PhotoDetailsModal'
import { usePhotoActions } from '../../hooks/usePhotoActions'
import { usePhotoSelection } from '../../hooks/usePhotoSelection'
import { ConfirmDialog, LoadingGrid } from '../../../../components/ui'

// Interface similar to PhotoGridProps
interface PhotoListProps {
  photos: Photo[]
  loading: boolean
  error: Error | null
  onUpdate: () => Promise<void>
  setError: (error: Error | null) => void
  albums?: AlbumWithDetails[]
  selectedPhotoIds?: Set<string>
  onSelectionChange?: (photoId: string, isSelected: boolean) => void
  onSelectAll?: (photoIds: string[]) => void // Add select all handler prop
}

export function PhotoList({
  photos,
  loading,
  error,
  onUpdate,
  setError,
  albums,
  selectedPhotoIds: externalSelectedPhotoIds,
  onSelectionChange: externalOnSelectionChange,
  onSelectAll: externalOnSelectAll
}: PhotoListProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null) // For details modal
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null) // For delete confirmation

  const photoActions = usePhotoActions({ setError })
  const internalPhotoSelection = usePhotoSelection()

  // Use external selection if provided, otherwise use internal
  const photoSelection = externalSelectedPhotoIds !== undefined ? {
    selectedPhotoIds: externalSelectedPhotoIds,
    handleSelectionChange: externalOnSelectionChange || (() => {}),
    handleSelectAll: externalOnSelectAll || (() => {}),
    clearSelection: () => {},
    selectedCount: externalSelectedPhotoIds.size
  } : internalPhotoSelection

  const allVisiblePhotoIds = photos.map(p => p.id);
  const areAllSelected = allVisiblePhotoIds.length > 0 && allVisiblePhotoIds.every(id => photoSelection.selectedPhotoIds.has(id));

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  if (loading) {
    return <LoadingGrid variant="compact" count={5} aspectRatio="custom" className={cc.spacing.section.sm} />
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
                    onChange={() => photoSelection.handleSelectAll(allVisiblePhotoIds)}
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
                const isSelected = photoSelection.selectedPhotoIds.has(photo.id);
                const photoAlbums = photo.album_photos?.map(({ album_id }) => albums?.find(a => a.id === album_id)).filter(Boolean);

                return (
                  <tr key={photo.id} className={`${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''} hover:bg-gray-50 dark:hover:bg-gray-800/50`}>
                    <td className="pl-4 pr-2 py-2 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-gray-700"
                        checked={isSelected}
                        onChange={(e) => photoSelection.handleSelectionChange(photo.id, e.target.checked)}
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
                      <div className={`flex flex-col items-end ${cc.spacing.section.xs}`}>
                        <button
                          onClick={() => photoActions.handleVisibilityToggle(photo)}
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
        <ConfirmDialog
          open={!!photoToDelete}
          onClose={() => setPhotoToDelete(null)}
          onConfirm={async () => {
            await photoActions.handleDelete(photoToDelete)
            setPhotoToDelete(null)
          }}
          title="Foto Verwijderen"
          message={`Weet je zeker dat je de foto "${photoToDelete.title}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`}
          variant="danger"
          isProcessing={photoActions.loading}
        />
      )}
    </>
  )
} 