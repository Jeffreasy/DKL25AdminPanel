const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://dklemailservice.onrender.com';

export interface Video {
  id: string;
  title: string;
  description: string | null;
  url: string;
  video_id: string;
  thumbnail_url: string | null;
  visible: boolean;
  order_number: number;
  created_at: string;
  updated_at: string;
}

export interface VideoCreateData {
  title: string;
  description?: string;
  url: string;
  visible?: boolean;
  order_number?: number;
}

export interface VideoUpdateData {
  title?: string;
  description?: string;
  url?: string;
  visible?: boolean;
  order_number?: number;
}

class VideoClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async getVideos(): Promise<Video[]> {
    const response = await fetch(`${API_BASE}/api/videos`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch videos: ${response.status}`);
    }

    return response.json();
  }

  async getVideo(id: string): Promise<Video> {
    const response = await fetch(`${API_BASE}/api/videos/${id}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.status}`);
    }

    return response.json();
  }

  async createVideo(data: VideoCreateData): Promise<Video> {
    const response = await fetch(`${API_BASE}/api/videos`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to create video: ${response.status}`);
    }

    return response.json();
  }

  async updateVideo(id: string, data: VideoUpdateData): Promise<Video> {
    const response = await fetch(`${API_BASE}/api/videos/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to update video: ${response.status}`);
    }

    return response.json();
  }

  async deleteVideo(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/videos/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete video: ${response.status}`);
    }
  }

  async reorderVideos(videoIds: Array<{ id: string; order_number: number }>): Promise<void> {
    const response = await fetch(`${API_BASE}/api/videos/reorder`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ videos: videoIds })
    });

    if (!response.ok) {
      throw new Error(`Failed to reorder videos: ${response.status}`);
    }
  }
}

export const videoClient = new VideoClient();