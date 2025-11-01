import { underConstructionClient } from '../../../api/client/underConstructionClient'
import type { UnderConstructionResponse, UnderConstructionFormData } from '../types'

export const underConstructionService = {
  getUnderConstruction: async (): Promise<UnderConstructionResponse> => {
    const data = await underConstructionClient.getActiveUnderConstruction()
    if (!data) {
      // No active under construction - return default data without creating in DB
      return {
        id: 0,
        isActive: false,
        title: 'Onder Constructie',
        message: 'Deze website is momenteel onder constructie...',
        footerText: 'Bedankt voor uw geduld!',
        logoUrl: null,
        expectedDate: null,
        socialLinks: [],
        progressPercentage: 0,
        contactEmail: null,
        newsletterEnabled: false,
        createdAt: '',
        updatedAt: '',
      }
    }
    return data
  },

  createUnderConstruction: async (data: UnderConstructionFormData): Promise<UnderConstructionResponse> => {
    return await underConstructionClient.createUnderConstruction(data)
  },

  updateUnderConstruction: async (id: number, data: UnderConstructionFormData): Promise<UnderConstructionResponse> => {
    return await underConstructionClient.updateUnderConstruction(id, data)
  },

  // Additional methods for admin functionality
  getUnderConstructionList: async (limit = 10, offset = 0): Promise<UnderConstructionResponse[]> => {
    return await underConstructionClient.getUnderConstructionList(limit, offset)
  },

  getUnderConstructionById: async (id: number): Promise<UnderConstructionResponse | null> => {
    return await underConstructionClient.getUnderConstructionById(id)
  },

  deleteUnderConstruction: async (id: number): Promise<void> => {
    return await underConstructionClient.deleteUnderConstruction(id)
  }
}