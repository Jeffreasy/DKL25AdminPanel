import { supabase } from '../../../lib/supabase'
import type { Aanmelding } from '../types'

export async function fetchAanmeldingen(): Promise<{ data: Aanmelding[], error: Error | null }> {
  try {
    // Log de start van de query
    // console.log('Starting aanmeldingen fetch...')

    // Voer de query uit met expliciete type casting
    const { data, error } = await supabase
      .from('aanmeldingen')
      .select(`
        id,
        created_at,
        updated_at,
        naam,
        email,
        telefoon,
        rol,
        afstand,
        ondersteuning,
        bijzonderheden,
        terms,
        email_verzonden,
        email_verzonden_op
      `)
      .order('created_at', { ascending: false })

    // Log de ruwe response
    // console.log('Raw response:', { data, error })

    if (error) {
      // console.error('Supabase error:', error) // Keep specific errors?
      throw error
    }

    // Valideer de data
    if (!data) {
      // console.warn('No data returned') // Keep warnings?
      return { data: [], error: null }
    }

    // Log de gevonden records
    // console.log('Found records:', {
    //   count: data.length,
    //   firstRecord: data[0],
    //   fields: data[0] ? Object.keys(data[0]) : []
    // })

    return { data, error: null }
  } catch (err) {
    // console.error('Error in fetchAanmeldingen:', err) // Keep specific errors?
    return { data: [], error: err as Error }
  }
}

export async function updateAanmelding(id: string, updates: Partial<Aanmelding>): Promise<{ error: Error | null }> {
  try {
    // Log de update actie
    // console.log('Updating aanmelding:', { id, updates })

    const { error } = await supabase
      .from('aanmeldingen')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      // console.error('Update error:', error) // Keep specific errors?
      throw error
    }

    // console.log('Update successful')
    return { error: null }
  } catch (err) {
    // console.error('Error in updateAanmelding:', err) // Keep specific errors?
    return { error: err as Error }
  }
}

// Helper functie om de table structuur te verifiëren
export async function verifyTableStructure(): Promise<void> {
  const { data, error } = await supabase
    .from('aanmeldingen')
    .select()
    .limit(1)

  // console.log('Table structure check:', {
  //   hasData: !!data,
  //   firstRecord: data?.[0],
  //   error,
  //   columns: data?.[0] ? Object.keys(data[0]) : []
  // })
} 