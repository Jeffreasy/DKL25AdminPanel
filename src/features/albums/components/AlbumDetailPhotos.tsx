import { PhotoOrderer } from './PhotoOrderer'
import type { AlbumWithDetails } from '../types'

interface AlbumDetailPhotosProps {
  album: AlbumWithDetails
  photosCount: number
  loading: boolean
  onOrderChange: () => Promise<void>
  onPhotoRemove: (photoId: string) => void
  onAddPhotos: () => void
  removingPhotoId?: string | null
}

export function AlbumDetailPhotos({
  album,
  photosCount,
  loading,
  onOrderChange,
  onPhotoRemove,
  onAddPhotos,
  removingPhotoId
}: AlbumDetailPhotosProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          <span className="sm:hidden">Foto's (Sleep/Klik 🗑️)</span>
          <span className="hidden sm:inline">Album Foto's (Sleep = sorteer, Klik 🗑️ = verwijder)</span>
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {photosCount} foto's
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      ) : photosCount === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Nog geen foto's in dit album
          </p>
          <button
            onClick={onAddPhotos}
            className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
          >
            Foto's toevoegen
          </button>
        </div>
      ) : (
        <PhotoOrderer
          album={album}
          onOrderChange={onOrderChange}
          onPhotoRemove={onPhotoRemove}
          removingPhotoId={removingPhotoId}
        />
      )}
    </div>
  )
}