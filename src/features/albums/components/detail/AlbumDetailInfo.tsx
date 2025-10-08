import type { AlbumWithDetails } from '../../types'
import { cc } from '../../../../styles/shared'

interface AlbumDetailInfoProps {
  album: AlbumWithDetails
  photosCount: number
  onCoverPhotoSelect: () => void
}

export function AlbumDetailInfo({ album, photosCount, onCoverPhotoSelect }: AlbumDetailInfoProps) {
  return (
    <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
        <div className="relative flex-shrink-0 w-full sm:w-48">
          <img
            src={album.cover_photo?.thumbnail_url || album.cover_photo?.url || ''}
            alt={album.title}
            className="w-full sm:w-48 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700"
            onError={(e) => {
               e.currentTarget.onerror = null;
               e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%239CA3AF' width='48' height='48'%3E%3Cpath d='M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm16.5-1.5H3.75V6h16.5v13.5z'/%3E%3C/svg%3E`;
               e.currentTarget.classList.add('p-4');
            }}
          />
          <button
            onClick={onCoverPhotoSelect}
            className={cc.button.icon({ size: 'sm', color: 'secondary', className: 'absolute bottom-1 right-1 bg-white/70 dark:bg-gray-900/70'})}
            title="Cover foto wijzigen"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          </button>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {album.title}
          </h3>
          {album.description && (
            <p className="mt-1 text-gray-500 dark:text-gray-400">{album.description}</p>
          )}
          <div className="mt-2 flex gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{photosCount} foto's</span>
            <span>•</span>
            <span>Volgorde: {album.order_number}</span>
          </div>
        </div>
      </div>
    </div>
  )
}