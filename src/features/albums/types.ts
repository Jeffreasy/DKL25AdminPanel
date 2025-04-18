import type { PhotoCount } from '../photos/types'

export interface Album {
  id: string;
  title: string;
  description?: string;
  cover_photo_id?: string;
  visible: boolean;
  order_number: number;
  created_at: string;
  updated_at: string;
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