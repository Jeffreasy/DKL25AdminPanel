import { supabase } from '../../../lib/supabase'
import type { Partner, CreatePartnerData, UpdatePartnerData } from '../types'

export async function fetchPartners() {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('order_number', { ascending: true })

  if (error) {
    console.error('Supabase error:', error)
    throw new Error('Kon partners niet ophalen')
  }

  const mappedPartners: Partner[] = (data || []).map(item => ({
    id: item.id,
    name: item.name,
    logo: item.logo,
    website: item.website,
    description: item.description,
    tier: item.tier,
    since: item.since,
    visible: item.visible,
    order_number: item.order_number,
    created_at: item.created_at,
    updated_at: item.updated_at
  }))

  return mappedPartners
}

export async function createPartner(partnerData: CreatePartnerData) {
  console.log('Creating partner:', partnerData) // Debug log

  const { data, error } = await supabase
    .from('partners')
    .insert([partnerData])
    .select()
    .single()

  if (error) {
    console.error('Supabase error:', error)
    throw new Error('Kon partner niet aanmaken')
  }

  return data as Partner
}

export async function updatePartner(id: string, updates: UpdatePartnerData) {
  const { data, error } = await supabase
    .from('partners')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Partner
}

export async function deletePartner(id: string) {
  const { error } = await supabase
    .from('partners')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function reorderPartners(orderedIds: string[]) {
  const updates = orderedIds.map((id, index) => ({
    id,
    order_number: index,
    updated_at: new Date().toISOString()
  }))

  const { error } = await supabase
    .from('partners')
    .upsert(updates)

  if (error) throw error
} 