import { supabase } from '../../../lib/supabase'
import type { Sponsor, SponsorFormData } from '../types'

export const sponsorService = {
  getSponsors: async (): Promise<Sponsor[]> => {
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('order_number', { ascending: true })

    if (error) {
      console.error('Error fetching sponsors:', error)
      throw error
    }

    return data.map(sponsor => ({
      id: sponsor.id,
      name: sponsor.name,
      description: sponsor.description,
      logoUrl: sponsor.logo_url,
      websiteUrl: sponsor.website_url,
      order: sponsor.order_number,
      isActive: sponsor.is_active,
      visible: sponsor.visible ?? true,
      createdAt: sponsor.created_at,
      updatedAt: sponsor.updated_at
    }))
  },

  createSponsor: async (data: SponsorFormData): Promise<Sponsor> => {
    const { data: sponsor, error } = await supabase
      .from('sponsors')
      .insert([{
        name: data.name,
        description: data.description,
        logo_url: data.logoUrl,
        website_url: data.websiteUrl,
        order_number: data.order,
        is_active: data.isActive,
        visible: data.visible
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating sponsor:', error)
      throw error
    }

    return {
      ...sponsor,
      visible: sponsor.visible ?? true
    }
  },

  updateSponsor: async (id: string, data: SponsorFormData): Promise<Sponsor> => {
    const { data: sponsor, error } = await supabase
      .from('sponsors')
      .update({
        name: data.name,
        description: data.description,
        logo_url: data.logoUrl,
        website_url: data.websiteUrl,
        order_number: data.order,
        is_active: data.isActive,
        visible: data.visible
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating sponsor:', error)
      throw error
    }

    return {
      ...sponsor,
      visible: sponsor.visible ?? true
    }
  },

  deleteSponsor: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('sponsors')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting sponsor:', error)
      throw error
    }
  }
} 