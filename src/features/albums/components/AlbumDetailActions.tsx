import { cc } from '../../../styles/shared'

interface AlbumDetailActionsProps {
  onAddPhotos: () => void
  onEditAlbum: () => void
  loading: boolean
}

export function AlbumDetailActions({ onAddPhotos, onEditAlbum, loading }: AlbumDetailActionsProps) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-2">
      <button
        onClick={onAddPhotos}
        disabled={loading}
        className={cc.button.base({ color: 'primary', className: 'w-full sm:w-auto' })}
      >
        <span className="sm:hidden">Toevoegen</span>
        <span className="hidden sm:inline">Foto's toevoegen</span>
      </button>
      <button
        onClick={onEditAlbum}
        disabled={loading}
        className={cc.button.base({ color: 'secondary', className: 'w-full sm:w-auto' })}
      >
        <span className="sm:hidden">Bewerken</span>
        <span className="hidden sm:inline">Album details bewerken</span>
      </button>
    </div>
  )
}