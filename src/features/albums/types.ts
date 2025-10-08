import type { PhotoCount } from '../photos/types'
import type { OrderedEntity } from '../../types/base'

export interface Album extends OrderedEntity {
  title: string;
  description?: string;
  cover_photo_id?: string;
  cover_photo?: import('../photos/types').Photo;
  photos?: AlbumPhoto[];
  photos_count: PhotoCount[];
}

export interface AlbumPhoto {
  album_id: string;
  photo_id: string;
  order_number: number;
  photo: import('../photos/types').Photo;
}

export type AlbumWithDetails = Album & {
  photos?: AlbumPhoto[];
  cover_photo?: import('../photos/types').Photo;
  album_photos?: { photo_id: string }[];
}; 