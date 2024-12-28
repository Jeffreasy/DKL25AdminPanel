import { supabase } from '../../../lib/supabase'
import type { Video, VideoInsert } from '../types'

// Ophalen van alle videos
export async function fetchVideos(): Promise<{ data: Video[], error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('order_number')

    if (error) throw error
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error fetching videos:', err)
    return { data: [], error: err as Error }
  }
}

// Video toevoegen
export async function addVideo(video: VideoInsert): Promise<{ data: Video | null, error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('videos')
      .insert([video])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (err) {
    console.error('Error adding video:', err)
    return { data: null, error: err as Error }
  }
}

// Video updaten
export async function updateVideo(videoId: string, updates: Partial<Video>): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('videos')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', videoId)

    if (error) throw error
    return { error: null }
  } catch (err) {
    console.error('Error updating video:', err)
    return { error: err as Error }
  }
}

// Video verwijderen (hard delete omdat we geen deleted_at hebben)
export async function deleteVideo(videoId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId)

    if (error) throw error
    return { error: null }
  } catch (err) {
    console.error('Error deleting video:', err)
    return { error: err as Error }
  }
}

// Video volgorde updaten
export async function updateVideoOrder(videoId: string, newOrder: number): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('videos')
      .update({
        order_number: newOrder,
        updated_at: new Date().toISOString()
      })
      .eq('id', videoId)

    if (error) throw error
    return { error: null }
  } catch (err) {
    console.error('Error updating video order:', err)
    return { error: err as Error }
  }
} 