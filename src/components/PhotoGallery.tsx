import { componentClasses as cc } from '../styles/shared'
import { cl } from '../styles/shared'
import { LoadingSkeleton } from './LoadingSkeleton'
import type { Photo } from '../types/photo'

interface PhotoGalleryProps {
  photos: Photo[]
  loading?: boolean
  onPhotoClick?: (photo: Photo) => void
}

export function PhotoGallery({ photos, loading, onPhotoClick }: PhotoGalleryProps) {
  if (loading) {
    return (
      <div className={cc.grid}>
        {[...Array(6)].map((_, i) => (
          <LoadingSkeleton key={i} className="aspect-square" />
        ))}
      </div>
    )
  }

  return (
    <div className={cc.grid}>
      {photos.map(photo => (
        <button
          key={photo.id}
          onClick={() => onPhotoClick?.(photo)}
          className={cl(
            cc.image.container,
            'group cursor-pointer'
          )}
        >
          <img
            src={photo.thumbnail_url || photo.url}
            alt={photo.alt}
            className={cc.image.fit}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </button>
      ))}
    </div>
  )
} 