import { sponsorClient } from '../../../api/client/sponsorClient'
import type { Sponsor, SponsorFormData } from '../types'

/**
 * Sponsor service using the Go backend API
 */
export const sponsorService = {
  getSponsors: async (): Promise<Sponsor[]> => {
    return sponsorClient.getSponsors()
  },

  createSponsor: async (data: SponsorFormData): Promise<Sponsor> => {
    return sponsorClient.createSponsor(data)
  },

  updateSponsor: async (id: string, data: SponsorFormData): Promise<Sponsor> => {
    return sponsorClient.updateSponsor(id, data)
  },

  deleteSponsor: async (id: string): Promise<void> => {
    return sponsorClient.deleteSponsor(id)
  }
}