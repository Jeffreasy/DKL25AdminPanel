import { Fragment, useState, useEffect } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { 
  UserCircleIcon, 
  KeyIcon, 
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline'
import { supabase } from '../../lib/supabase/supabaseClient'

interface UserMenuProps {
  user: {
    id: string;
    email?: string;
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<{ avatar_url: string | null; display_name: string | null } | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, display_name')
        .eq('id', user.id)
        .single()

      if (data) setProfile(data)
    }

    fetchProfile()
  }, [user.id])

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-x-4 px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <UserCircleIcon className="h-8 w-8 text-gray-400" />
        )}
        <span>{profile?.display_name || user.email}</span>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => navigate('/dashboard/account-settings')}
                  className={`
                    ${active ? 'bg-gray-100' : ''} 
                    flex w-full items-center px-4 py-2 text-sm text-gray-700 gap-2
                  `}
                >
                  <KeyIcon className="h-5 w-5" />
                  Account instellingen
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => signOut()}
                  className={`
                    ${active ? 'bg-gray-100' : ''} 
                    flex w-full items-center px-4 py-2 text-sm text-gray-700 gap-2
                  `}
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  Uitloggen
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
} 