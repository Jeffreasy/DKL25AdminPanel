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
    // Select all photo fields plus the album_id from the junction table
    .select('*, album_photos(album_id)') 
    .order('created_at', { ascending: false })

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

export async function fetchPhotoAlbums(photoId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('album_photos')
    .select('album_id')
    .eq('photo_id', photoId)

  if (error) throw error
  return data.map(item => item.album_id)
}

export async function fetchAllAlbums(): Promise<AlbumWithDetails[]> {
  // 1. Fetch basic album data + cover_photo_id + photo count
  const { data: albumsData, error: albumsError } = await supabase
    .from('albums')
    // Cleaned up select string
    .select(`
      id,
      title,
      description,
      visible,
      order_number,
      created_at,
      updated_at,
      cover_photo_id,
      photos_count:album_photos(count)
    `)
    .order('order_number')

  if (albumsError) throw albumsError
  if (!albumsData) return [];

  // 2. Extract non-null cover photo IDs
  const coverPhotoIds = albumsData
    .map(album => album.cover_photo_id)
    .filter((id): id is string => id !== null && id !== undefined);

  // 3. Fetch cover photos if there are any IDs
  let coverPhotosMap: Map<string, Photo> = new Map();
  if (coverPhotoIds.length > 0) {
    const { data: photosData, error: photosError } = await supabase
      .from('photos')
      .select('*') // Select all needed photo fields
      .in('id', coverPhotoIds);

    if (photosError) {
      console.error("Error fetching cover photos:", photosError); 
      // Continue without cover photos instead of throwing? Or throw photosError;
    } else if (photosData) {
      photosData.forEach(photo => coverPhotosMap.set(photo.id, photo as Photo));
    }
  }

  // 4. Combine album data with fetched cover photos
  const transformedData = albumsData.map(album => {
    const coverPhoto = album.cover_photo_id ? coverPhotosMap.get(album.cover_photo_id) || null : null;
    
    return {
      // Omit only cover_photo and photos, keep photos_count
      ...(album as Omit<AlbumWithDetails, 'cover_photo' | 'photos'>),
      cover_photo: coverPhoto, 
      // Use the photos_count from the original album data
      photos_count: album.photos_count || [{ count: 0 }],
      photos: [] 
    } as AlbumWithDetails;
  });

  return transformedData;
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

// New function to add multiple photos to multiple albums
export async function addPhotosToAlbums(photoIds: string[], albumIds: string[]): Promise<void> {
  if (photoIds.length === 0 || albumIds.length === 0) {
    return // Nothing to do
  }

  const relations: PhotoAlbumRelation[] = [];

  // For each album, find the next order number
  for (const albumId of albumIds) {
    const { data: lastPhoto, error: orderError } = await supabase
      .from('album_photos')
      .select('order_number')
      .eq('album_id', albumId)
      .order('order_number', { ascending: false })
      .limit(1)
      .maybeSingle() // Use maybeSingle to handle albums with no photos

    if (orderError) {
      console.error(`Error fetching last order number for album ${albumId}:`, orderError)
      // Decide if you want to skip this album or throw an error
      continue // Skip this album on error
    }

    let nextOrderNumber = (lastPhoto?.order_number || 0) + 1

    // Create relations for all new photos for this album
    for (const photoId of photoIds) {
      relations.push({
        photo_id: photoId,
        album_id: albumId,
        order_number: nextOrderNumber++
      })
    }
  }

  // Bulk insert all relations
  if (relations.length > 0) {
    const { error } = await supabase
      .from('album_photos')
      .insert(relations)

    if (error) {
      console.error('Error inserting photo-album relations:', error)
      throw error // Re-throw the error to be handled by the caller
    }
  }
}

export async function removePhotoFromAlbum(photoId: string, albumId: string): Promise<void> {
  const { error } = await supabase
    .from('album_photos')
    .delete()
    .match({ photo_id: photoId, album_id: albumId })

  if (error) throw error
} 