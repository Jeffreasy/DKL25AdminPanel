interface EventDetail {
  icon: string
  title: string
  description: string
}

export interface TitleSection {
  id: string
  title: string
  subtitle: string
  cta_text: string
  event_details: EventDetail[]
  image_url: string
  created_at: string
  updated_at: string
} 