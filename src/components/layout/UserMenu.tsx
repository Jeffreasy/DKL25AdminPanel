import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Link } from 'react-router-dom'
import { 
  UserCircleIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/hooks/useAuth'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function UserMenu() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Error logging out:', err)
    }
  }

  if (!user) return null

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Gebruiker'

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="-m-1.5 flex items-center p-1.5">
        <span className="sr-only">Open user menu</span>
        <div className="flex items-center gap-x-3">
          {user.user_metadata?.avatar_url ? (
            <img
              className="h-8 w-8 rounded-full"
              src={user.user_metadata.avatar_url}
              alt=""
            />
          ) : (
            <UserCircleIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" aria-hidden="true" />
          )}
          <div className="hidden lg:flex lg:items-center">
            <span className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100">
              {displayName}
            </span>
            <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
          </div>
        </div>
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
        <Menu.Items className="absolute right-0 z-10 mt-2.5 w-auto min-w-[10rem] origin-top-right rounded-md bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none">
          <div className="px-3 py-2 text-sm border-b border-gray-100 dark:border-gray-700">
            <div className="font-medium text-gray-900 dark:text-gray-100">{displayName}</div>
            <div className="text-gray-500 dark:text-gray-400 text-xs truncate">{user.email}</div>
          </div>
          
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/profile"
                className={classNames(
                  active ? 'bg-gray-100 dark:bg-gray-700' : '',
                  'block px-3 py-1 text-sm leading-6 text-gray-900 dark:text-gray-200'
                )}
              >
                <div className="flex items-center">
                  <UserCircleIcon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  Profiel
                </div>
              </Link>
            )}
          </Menu.Item>
          
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/settings"
                className={classNames(
                  active ? 'bg-gray-100 dark:bg-gray-700' : '',
                  'block px-3 py-1 text-sm leading-6 text-gray-900 dark:text-gray-200'
                )}
              >
                <div className="flex items-center">
                  <Cog6ToothIcon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  Instellingen
                </div>
              </Link>
            )}
          </Menu.Item>
          
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleLogout}
                className={classNames(
                  active ? 'bg-gray-100 dark:bg-gray-700' : '',
                  'block w-full text-left px-3 py-1 text-sm leading-6 text-gray-900 dark:text-gray-200'
                )}
              >
                <div className="flex items-center">
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  Uitloggen
                </div>
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
} 