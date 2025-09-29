import { supabase } from '../../../lib/supabase'
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

    return {
      id: data.id,
      isActive: data.is_active,
      title: data.title,
      message: data.message,
      footerText: data.footer_text,
      logoUrl: data.logo_url,
      expectedDate: data.expected_date,
      socialLinks: data.social_links,
      progressPercentage: data.progress_percentage,
      contactEmail: data.contact_email,
      newsletterEnabled: data.newsletter_enabled,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  },

  createUnderConstruction: async (data: UnderConstructionFormData): Promise<UnderConstruction> => {
    const { data: item, error } = await supabase
      .from('under_construction')
      .insert([{
        is_active: data.isActive,
        title: data.title,
        message: data.message,
        footer_text: data.footerText,
        logo_url: data.logoUrl,
        expected_date: data.expectedDate,
        social_links: data.socialLinks,
        progress_percentage: data.progressPercentage,
        contact_email: data.contactEmail,
        newsletter_enabled: data.newsletterEnabled
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating under construction:', error)
      throw error
    }

    return {
      id: item.id,
      isActive: item.is_active,
      title: item.title,
      message: item.message,
      footerText: item.footer_text,
      logoUrl: item.logo_url,
      expectedDate: item.expected_date,
      socialLinks: item.social_links,
      progressPercentage: item.progress_percentage,
      contactEmail: item.contact_email,
      newsletterEnabled: item.newsletter_enabled,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }
  },

  updateUnderConstruction: async (id: number, data: UnderConstructionFormData): Promise<UnderConstruction> => {
    const { data: item, error } = await supabase
      .from('under_construction')
      .update({
        is_active: data.isActive,
        title: data.title,
        message: data.message,
        footer_text: data.footerText,
        logo_url: data.logoUrl,
        expected_date: data.expectedDate,
        social_links: data.socialLinks,
        progress_percentage: data.progressPercentage,
        contact_email: data.contactEmail,
        newsletter_enabled: data.newsletterEnabled,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating under construction:', error)
      throw error
    }

    return {
      id: item.id,
      isActive: item.is_active,
      title: item.title,
      message: item.message,
      footerText: item.footer_text,
      logoUrl: item.logo_url,
      expectedDate: item.expected_date,
      socialLinks: item.social_links,
      progressPercentage: item.progress_percentage,
      contactEmail: item.contact_email,
      newsletterEnabled: item.newsletter_enabled,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }
  }
}