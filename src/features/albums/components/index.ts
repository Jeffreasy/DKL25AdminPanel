/**
 * Albums Feature Components
 *
 * This module provides a complete set of components for album management,
 * including display, editing, and preview functionality.
 *
 * @module features/albums/components
 */

// Display components - Optimized with memoization
export { AlbumCard } from './display/AlbumCard'
export { AlbumGrid } from './display/AlbumGrid'

// Detail components - Refactored for better separation of concerns
export { AlbumDetailModal } from './detail/AlbumDetailModal'
export { AlbumDetailHeader } from './detail/AlbumDetailHeader'
export { AlbumDetailInfo } from './detail/AlbumDetailInfo'
export { AlbumDetailActions } from './detail/AlbumDetailActions'
export { AlbumDetailPhotos } from './detail/AlbumDetailPhotos'

// Form components - Use custom hooks for state management
export { AlbumForm } from './forms/AlbumForm'
export { PhotoSelector } from './forms/PhotoSelector'
export { PhotoOrderer } from './forms/PhotoOrderer'
export { CoverPhotoSelector } from './forms/CoverPhotoSelector'
export { SortablePhoto } from './forms/SortablePhoto'

// Preview components - For public gallery display
export { GalleryPreviewModal } from './preview/GalleryPreviewModal'
export { default as PhotoGalleryPreview } from './preview/PhotoGalleryPreview'
export { default as MainSlider } from './preview/MainSlider'
export { default as ThumbnailSlider } from './preview/ThumbnailSlider'
export { default as ImageModal } from './preview/ImageModal'
export { default as NavigationButton } from './preview/NavigationButton'

// Error boundary - For error handling
export { ErrorBoundary } from './ErrorBoundary'