import type { Aanmelding } from '../features/aanmeldingen/types'
import type { ContactMessage, ContactStats } from '../features/contact/types'

export interface DashboardStats {
  totaal: number
  rollen: Record<string, number>
  afstanden: Record<string, number>
  ondersteuning: Record<string, number>
}

export interface DashboardContext {
  stats: DashboardStats
  contactStats: ContactStats
  aanmeldingen: Aanmelding[]
  messages: ContactMessage[]
  handleUpdate: () => void
} 