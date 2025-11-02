import type { Photo } from '../../features/photos/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://dklemailservice.onrender.com';

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

export interface AlbumCreateData {
  title: string;
  description?: string;
  cover_photo_id?: string;
  visible?: boolean;
  order_number?: number;
}

export interface AlbumUpdateData {
  title?: string;
  description?: string;
  cover_photo_id?: string;
  visible?: boolean;
  order_number?: number;
}

export interface AlbumPhoto {
  album_id: string;
  photo_id: string;
  order_number: number;
}

class AlbumClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async getAlbums(): Promise<Album[]> {
    const response = await fetch(`${API_BASE}/api/albums`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch albums: ${response.status}`);
    }

    return response.json();
  }

  async getAlbumsAdmin(): Promise<Album[]> {
    const response = await fetch(`${API_BASE}/api/albums/admin`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch albums: ${response.status}`);
    }

    const data = await response.json();
    // Handle both wrapped and unwrapped responses
    return Array.isArray(data) ? data : (data.data || []);
  }

  async getAlbum(id: string): Promise<Album> {
    const response = await fetch(`${API_BASE}/api/albums/${id}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch album: ${response.status}`);
    }

    const data = await response.json();
    // Handle both wrapped and unwrapped responses
    return data.data || data;
  }

  async getAlbumPhotos(albumId: string): Promise<Photo[]> {
    const response = await fetch(`${API_BASE}/api/albums/${albumId}/photos`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch album photos: ${response.status}`);
    }

    return response.json();
  }

  async createAlbum(data: AlbumCreateData): Promise<Album> {
    const response = await fetch(`${API_BASE}/api/albums`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to create album: ${response.status}`);
    }

    return response.json();
  }

  async updateAlbum(id: string, data: AlbumUpdateData): Promise<Album> {
    const response = await fetch(`${API_BASE}/api/albums/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to update album: ${response.status}`);
    }

    return response.json();
  }

  async deleteAlbum(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/albums/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete album: ${response.status}`);
    }
  }

  async addPhotosToAlbum(albumId: string, photoIds: string[]): Promise<void> {
    const response = await fetch(`${API_BASE}/api/albums/${albumId}/photos`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ photo_ids: photoIds })
    });

    if (!response.ok) {
      throw new Error(`Failed to add photos to album: ${response.status}`);
    }
  }

  async removePhotoFromAlbum(albumId: string, photoId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/albums/${albumId}/photos/${photoId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to remove photo from album: ${response.status}`);
    }
  }

  async reorderAlbums(albumIds: Array<{ id: string; order_number: number }>): Promise<void> {
    const response = await fetch(`${API_BASE}/api/albums/reorder`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ albums: albumIds })
    });

    if (!response.ok) {
      throw new Error(`Failed to reorder albums: ${response.status}`);
    }
  }

  async reorderAlbumPhotos(albumId: string, photoIds: Array<{ photo_id: string; order_number: number }>): Promise<void> {
    const response = await fetch(`${API_BASE}/api/albums/${albumId}/photos/reorder`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ photos: photoIds })
    });

    if (!response.ok) {
      throw new Error(`Failed to reorder album photos: ${response.status}`);
    }
  }
}

export const albumClient = new AlbumClient();