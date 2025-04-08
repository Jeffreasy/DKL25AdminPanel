import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { componentClasses as cc } from '../../../styles/shared'
import { cl } from '../../../styles/shared'

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
      <h2 className={cc.listItem.title}>Beheer Admins</h2>
      
      <form onSubmit={addAdmin} className="flex gap-2">
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Email van nieuwe admin"
          className={cc.form.input}
        />
        <button type="submit" className={cc.button.primary}>
          Toevoegen
        </button>
      </form>

      {error && <p className={cc.form.error}>{error}</p>}

      <ul className="divide-y">
        {admins.map(admin => (
          <li key={admin.id} className={cc.listItem.container}>
            <div className={cc.listItem.content}>
              <span className={cc.listItem.title}>{admin.email}</span>
              <button
                onClick={() => removeAdmin(admin.id)}
                className={cl(cc.button.icon, 'hover:text-red-600 hover:bg-red-50')}
              >
                Verwijderen
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
} 