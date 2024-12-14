export interface SocialEmbed {
  id: string
  platform: 'facebook' | 'instagram'
  embed_code: string
  post_url: string
  likes_count: number
  created_at: string
  updated_at: string
} 