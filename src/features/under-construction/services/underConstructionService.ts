import { supabase } from '../../../api/client/supabase'
import { keysToCamel, keysToSnake } from '../../../utils/caseConverter'
import type { UnderConstruction, UnderConstructionFormData } from '../types'

export const underConstructionService = {
  getUnderConstruction: async (): Promise<UnderConstruction> => {
    const { data, error } = await supabase
      .from('under_construction')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned, create default
        return await underConstructionService.createUnderConstruction({
          isActive: false,
          title: 'Onder Constructie',
          message: 'Deze website is momenteel onder constructie...',
          footerText: 'Bedankt voor uw geduld!',
          logoUrl: '',
          expectedDate: null,
          socialLinks: [],
          progressPercentage: 0,
          contactEmail: '',
          newsletterEnabled: false
        })
      }
      console.error('Error fetching under construction:', error)
      throw error
    }

    return keysToCamel<UnderConstruction>(data)
  },

  createUnderConstruction: async (data: UnderConstructionFormData): Promise<UnderConstruction> => {
    const dbData = keysToSnake(data)
    const { data: item, error } = await supabase
      .from('under_construction')
      .insert([dbData])
      .select()
      .single()

    if (error) {
      console.error('Error creating under construction:', error)
      throw error
    }

    return keysToCamel<UnderConstruction>(item)
  },

  updateUnderConstruction: async (id: number, data: UnderConstructionFormData): Promise<UnderConstruction> => {
    const dbData = {
      ...keysToSnake(data),
      updated_at: new Date().toISOString()
    }
    const { data: item, error } = await supabase
      .from('under_construction')
      .update(dbData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating under construction:', error)
      throw error
    }

    return keysToCamel<UnderConstruction>(item)
  }
}