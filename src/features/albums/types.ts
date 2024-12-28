import type { Photo } from '../photos/types'

export interface Album {
  id: string;
  title: string;
  description?: string;
  cover_photo_id?: string;
  visible: boolean;
  order_number: number;
  created_at: string;
  updated_at: string;
}

export interface AlbumWithDetails extends Album {
  cover_photo?: Photo | null;
  photos_count: {
    count: number;
    photo_id: string;
  }[];
}

export interface AlbumPhoto {
  album_id: string;
  photo_id: string;
  order_number: number;
} 