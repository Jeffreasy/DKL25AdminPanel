import { useState, useEffect } from 'react'
import { useAuth } from '../features/auth/AuthContext'
import { supabase } from '../lib/supabase/supabaseClient'
import { uploadToCloudinary } from '../lib/cloudinary/cloudinaryClient'
import { UserCircleIcon } from '@heroicons/react/24/outline'

interface Profile {
  id: string
  avatar_url: string | null
  user_role: 'admin' | 'moderator' | 'user'
  display_name: string | null
  created_at: string
  updated_at: string
}

export function AccountSettingsPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch profile data
  useEffect(() => {
    async function fetchProfile() {
      try {
        if (!user?.id) return

        // Eerst controleren of er al een profiel bestaat
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (fetchError) {
          // Als er geen profiel bestaat, maak er dan een aan
          if (fetchError.code === 'PGRST116') {
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                display_name: '',
                user_role: 'user',
                avatar_url: null
              })
              .select()
              .single()

            if (insertError) throw insertError
            setProfile(newProfile)
            setDisplayName(newProfile.display_name || '')
          } else {
            throw fetchError
          }
        } else {
          setProfile(existingProfile)
          setDisplayName(existingProfile.display_name || '')
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Kon profielgegevens niet laden')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user?.id])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsUpdating(true)

    try {
      let avatar_url = profile?.avatar_url

      if (avatarFile) {
        const uploadResult = await uploadToCloudinary(avatarFile)
        avatar_url = uploadResult.url
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url,
          display_name: displayName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id)

      if (error) throw error

      setSuccess('Profiel succesvol bijgewerkt')
      setAvatarFile(null)
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Kon profiel niet bijwerken')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return <div>Laden...</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900">Account Instellingen</h2>
          
          <div className="mt-6 space-y-6">
            {/* Profiel sectie */}
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {/* Avatar upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Profielfoto
                </label>
                <div className="mt-2 flex items-center gap-x-3">
                  <div className="relative">
                    {(profile?.avatar_url || avatarFile) && (
                      <img
                        src={avatarFile ? URL.createObjectURL(avatarFile) : profile?.avatar_url!}
                        alt="Avatar"
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    )}
                    {!profile?.avatar_url && !avatarFile && (
                      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <UserCircleIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setAvatarFile(file)
                    }}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                </div>
              </div>

              {/* Display name */}
              <div>
                <label htmlFor="display-name" className="block text-sm font-medium text-gray-700">
                  Weergavenaam
                </label>
                <input
                  type="text"
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              {/* Role display */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rol
                </label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {profile?.user_role || 'Gebruiker'}
                  </span>
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}

              {success && (
                <div className="text-sm text-green-600">{success}</div>
              )}

              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isUpdating ? 'Bezig met opslaan...' : 'Profiel opslaan'}
              </button>
            </form>

            {/* Bestaande wachtwoord wijzigen sectie */}
            {/* ... */}
          </div>
        </div>
      </div>
    </div>
  )
} 