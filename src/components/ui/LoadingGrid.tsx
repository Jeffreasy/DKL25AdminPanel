import { LoadingSkeleton } from '../LoadingSkeleton'
import { cc } from '../../styles/shared'

export interface LoadingGridProps {
  count?: number
  variant?: 'photos' | 'albums' | 'thumbnails' | 'compact' | 'stats'
  aspectRatio?: 'square' | 'video' | 'custom'
  className?: string
}

/**
 * Herbruikbare loading grid component
 * Toont skeleton loaders in verschillende grid layouts
 */
export function LoadingGrid({
  count = 12,
  variant = 'photos',
  aspectRatio = 'square',
  className = ''
}: LoadingGridProps) {
  const gridClass = {
    photos: cc.grid.photos(),
    albums: cc.grid.albums(),
    thumbnails: cc.grid.thumbnails(),
    compact: cc.grid.compact(),
    stats: cc.grid.stats()
  }[variant]

  const aspectClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    custom: ''
  }[aspectRatio]

  return (
    <div className={`${gridClass} ${className}`}>
      {[...Array(count)].map((_, i) => (
        <LoadingSkeleton 
          key={i} 
          className={`${aspectClass} rounded-xl bg-gray-200 dark:bg-gray-700`} 
        />
      ))}
    </div>
  )
}

export default LoadingGrid