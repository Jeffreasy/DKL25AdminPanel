import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

interface Admin {
  id: string
  email: string
  created_at: string
}

export function AdminsManagement() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [newEmail, setNewEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAdmins()
  }, [])

  const loadAdmins = async () => {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error loading admins:', error)
      return
    }

    setAdmins(data)
  }

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { data: existingUser } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', newEmail)
        .single()

      if (!existingUser) {
        setError('Gebruiker moet eerst een account aanmaken')
        return
      }

      await supabase
        .from('admins')
        .insert([{ 
          user_id: existingUser.id,
          email: newEmail 
        }])

      setNewEmail('')
      loadAdmins()
    } catch (err) {
      console.error('Error adding admin:', err)
      setError('Kon admin niet toevoegen')
    }
  }

  const removeAdmin = async (id: string) => {
    try {
      await supabase
        .from('admins')
        .delete()
        .eq('id', id)

      loadAdmins()
    } catch (err) {
      console.error('Error removing admin:', err)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Beheer Admins</h2>
      
      <form onSubmit={addAdmin} className="flex gap-2">
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Email van nieuwe admin"
          className="input-primary flex-1"
        />
        <button type="submit" className="btn-primary">
          Toevoegen
        </button>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <ul className="divide-y">
        {admins.map(admin => (
          <li key={admin.id} className="py-2 flex justify-between items-center">
            <span>{admin.email}</span>
            <button
              onClick={() => removeAdmin(admin.id)}
              className="text-red-600 hover:text-red-800"
            >
              Verwijderen
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
} 