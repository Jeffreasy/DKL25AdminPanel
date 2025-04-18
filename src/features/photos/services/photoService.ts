import { supabase } from '../../../lib/supabase'
import type { Photo } from '../types'
import type { AlbumWithDetails } from '../../albums/types' // Adjusted path for AlbumWithDetails

interface PhotoAlbumRelation {
  photo_id: string
  album_id: string
  order_number: number
}

export async function fetchPhotos(): Promise<Photo[]> {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .order('order_number')

  if (error) throw error
  return data
}

export async function deletePhoto(photoId: string): Promise<void> {
  // 1. Verwijder eerst alle album relaties
  await supabase
    .from('album_photos')
    .delete()
    .eq('photo_id', photoId)

  // 2. Update albums waar deze foto de cover was
  await supabase
    .from('albums')
    .update({ cover_photo_id: null })
    .eq('cover_photo_id', photoId)

  // 3. Verwijder de foto zelf
  const { error } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId)

  if (error) throw error
}

export async function updatePhotoVisibility(photoId: string, visible: boolean): Promise<void> {
  const { error } = await supabase
    .from('photos')
    .update({ visible })
    .eq('id', photoId)

  if (error) throw error
}

export async function updatePhotoOrder(photoId: string, newOrder: number): Promise<void> {
  const { error } = await supabase
    .from('photos')
    .update({ order_number: newOrder })
    .eq('id', photoId)

  if (error) throw error
}

export async function fetchPhotoAlbums(photoId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('album_photos')
    .select('album_id')
    .eq('photo_id', photoId)

  if (error) throw error
  return data.map(item => item.album_id)
}

export async function fetchAllAlbums(): Promise<AlbumWithDetails[]> {
  const { data, error } = await supabase
    .from('albums')
    .select(`
      *,
      cover_photo:photos!cover_photo_id(*),
      album_photos(photo_id)
    `)
    .order('order_number')

  if (error) throw error
  return data
}

export async function addPhotoToAlbum(photoId: string, albumId: string): Promise<void> {
  // Haal laatste order number op
  const { data: lastPhoto } = await supabase
    .from('album_photos')
    .select('order_number')
    .eq('album_id', albumId)
    .order('order_number', { ascending: false })
    .limit(1)
    .single()

  const nextOrderNumber = (lastPhoto?.order_number || 0) + 1

  const newRelation: PhotoAlbumRelation = {
    photo_id: photoId,
    album_id: albumId,
    order_number: nextOrderNumber
  }

  const { error } = await supabase
    .from('album_photos')
    .insert(newRelation)

  if (error) throw error
}

export async function removePhotoFromAlbum(photoId: string, albumId: string): Promise<void> {
  const { error } = await supabase
    .from('album_photos')
    .delete()
    .match({ photo_id: photoId, album_id: albumId })

  if (error) throw error
} 