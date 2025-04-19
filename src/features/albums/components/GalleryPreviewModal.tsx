import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { supabase } from '../../../lib/supabase'
import type { Photo, Album } from './gallery_preview/types'
import { Z_INDEX } from '../../../constants/zIndex'
import { cc } from '../../../styles/shared'
import { XMarkIcon } from '@heroicons/react/24/outline'
import PhotoGalleryPreview from './gallery_preview/PhotoGalleryPreview'
import type { PublicAlbumPreview } from './gallery_preview/PhotoGalleryPreview'

interface GalleryPreviewModalProps {
  open: boolean
  onClose: () => void
}

interface FetchedAlbum {
    id: string;
    title: string;
    description: string | null;
}

interface AlbumPhotoRelation {
    album_id: string;
    photo_id: string;
    order_number: number;
}

export function GalleryPreviewModal({ open, onClose }: GalleryPreviewModalProps) {
  const [galleryData, setGalleryData] = useState<PublicAlbumPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchPublicGallery()
    }
  }, [open])

  const fetchPublicGallery = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: visibleAlbums, error: albumsError } = await supabase
        .from('albums')
        .select('id, title, description')
        .eq('visible', true)
        .order('order_number', { ascending: true })

      if (albumsError) throw albumsError
      const fetchedAlbums: FetchedAlbum[] = visibleAlbums || [];

      if (fetchedAlbums.length === 0) {
        setGalleryData([])
        setLoading(false)
        return
      }

      const albumIds = fetchedAlbums.map((a: FetchedAlbum) => a.id);
      const { data: albumPhotoRelationsData, error: relationsError } = await supabase
        .from('album_photos')
        .select('album_id, photo_id, order_number')
        .in('album_id', albumIds)
        .order('order_number', { ascending: true });

      if (relationsError) throw relationsError;
      const albumPhotoRelations: AlbumPhotoRelation[] = albumPhotoRelationsData || [];

      if (albumPhotoRelations.length === 0) {
          const albumsWithNoPhotos: PublicAlbumPreview[] = fetchedAlbums.map((album: FetchedAlbum) => ({
            id: album.id,
            title: album.title,
            description: album.description,
            photos: []
          }));
          setGalleryData(albumsWithNoPhotos)
          setLoading(false)
          return;
      }

      const uniquePhotoIds = [...new Set(albumPhotoRelations.map((rel: AlbumPhotoRelation) => rel.photo_id))];
      if (uniquePhotoIds.length === 0) {
          const albumsWithNoPhotos: PublicAlbumPreview[] = fetchedAlbums.map((album: FetchedAlbum) => ({
            id: album.id,
            title: album.title,
            description: album.description,
            photos: []
          }));
          setGalleryData(albumsWithNoPhotos)
          setLoading(false)
          return;
      }

      const { data: photosData, error: photosError } = await supabase
        .from('photos')
        .select('id, url, thumbnail_url, alt_text, visible, created_at, updated_at, title, description, year')
        .in('id', uniquePhotoIds)
        .eq('visible', true);

      if (photosError) throw photosError;
      const fetchedPhotos: Photo[] = (photosData as Photo[]) || [];

      if (fetchedPhotos.length === 0) {
          const albumsWithNoPhotos: PublicAlbumPreview[] = fetchedAlbums.map((album: FetchedAlbum) => ({
            id: album.id,
            title: album.title,
            description: album.description,
            photos: []
          }));
          setGalleryData(albumsWithNoPhotos)
          setLoading(false)
          return;
      }

      const photosMap = new Map(fetchedPhotos.map(p => [p.id, p]));

      const populatedAlbums: PublicAlbumPreview[] = fetchedAlbums.map((album: FetchedAlbum) => {
          const photosForThisAlbum: Photo[] = albumPhotoRelations
            .filter((rel: AlbumPhotoRelation) => rel.album_id === album.id)
            .map((rel: AlbumPhotoRelation) => photosMap.get(rel.photo_id))
            .filter((p): p is Photo => p !== undefined);
          
          return {
              id: album.id,
              title: album.title,
              description: album.description,
              photos: photosForThisAlbum,
          };
      }).filter(album => album.photos.length > 0);
      
      setGalleryData(populatedAlbums)

    } catch (err) {
      console.error("Error fetching public gallery data:", err)
      setError("Kon galerij gegevens niet laden.")
      setGalleryData([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} className={`relative z-[${Z_INDEX.PREVIEW_MODAL}]`}>
      <div className={`fixed inset-0 bg-black/50 z-[${Z_INDEX.PREVIEW_MODAL}]`} aria-hidden="true" />
      
      <div className={`fixed inset-0 flex items-center justify-center p-4 z-[${Z_INDEX.PREVIEW_MODAL}]`}>
        <Dialog.Panel className={cc.card({ className: "w-full max-w-5xl max-h-[90vh] flex flex-col p-0"})}>
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
            <Dialog.Title as="h2" className="text-lg font-medium text-gray-900 dark:text-white">
              Gallerij Preview
            </Dialog.Title>
            <button
              onClick={onClose}
              className={cc.button.icon({ color: 'secondary' })}
              title="Sluiten"
            >
              <span className="sr-only">Sluiten</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 flex-grow overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
            {loading && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-10">Galerij laden...</p>
            )}
            {error && (
              <div className={`${cc.alert({ status: 'error' })} mx-auto max-w-lg`}>{error}</div>
            )}
            {!loading && !error && (
              <PhotoGalleryPreview galleryData={galleryData} />
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}

// Note: You might need to add Z_INDEX.PREVIEW_MODAL to your constants/zIndex.ts file
// with a value higher than BASE_MODAL, e.g., Z_INDEX.BASE_MODAL + 10 