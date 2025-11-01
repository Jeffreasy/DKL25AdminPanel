import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Link } from 'react-router-dom'
import {
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../features/auth'
import { cc, cl } from '../../styles/shared'

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
        <div className={`flex items-center ${cc.spacing.gap.md}`}>
          {user.user_metadata?.avatar_url ? (
            <img
              className="h-8 w-8 rounded-full"
              src={user.user_metadata.avatar_url}
              alt={displayName}
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
        enter={`${cc.transition.fast} ease-out`}
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave={`${cc.transition.fast} ease-in`}
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className={`absolute right-0 z-10 mt-2.5 w-auto min-w-[10rem] origin-top-right rounded-md bg-white dark:bg-gray-800 ${cc.spacing.py.sm} shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none`}>
          <div className={`${cc.spacing.px.md} ${cc.spacing.py.sm} text-sm border-b border-gray-100 dark:border-gray-700`}>
            <div className="font-medium text-gray-900 dark:text-gray-100">{displayName}</div>
            <div className="text-gray-500 dark:text-gray-400 text-xs truncate">{user.email}</div>
            {/* RBAC Roles Display */}
            {user.roles && user.roles.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {user.roles.map((role) => (
                  <span
                    key={role.id}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
                  >
                    {role.name}
                  </span>
                ))}
              </div>
            )}
            {/* Legacy Role Display (fallback) */}
            {(!user.roles || user.roles.length === 0) && user.role && (
              <div className="mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {user.role}
                </span>
              </div>
            )}
          </div>
          
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/profile"
                className={cl(
                  active && 'bg-gray-100 dark:bg-gray-700',
                  `block ${cc.spacing.px.md} py-1 text-sm leading-6 text-gray-900 dark:text-gray-200 ${cc.transition.colors}`
                )}
              >
                <div className="flex items-center">
                  <UserCircleIcon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" aria-hidden="true" />
                  Profiel
                </div>
              </Link>
            )}
          </Menu.Item>
          
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/settings"
                className={cl(
                  active && 'bg-gray-100 dark:bg-gray-700',
                  `block ${cc.spacing.px.md} py-1 text-sm leading-6 text-gray-900 dark:text-gray-200 ${cc.transition.colors}`
                )}
              >
                <div className="flex items-center">
                  <Cog6ToothIcon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" aria-hidden="true" />
                  Instellingen
                </div>
              </Link>
            )}
          </Menu.Item>
          
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleLogout}
                className={cl(
                  active && 'bg-gray-100 dark:bg-gray-700',
                  `block w-full text-left ${cc.spacing.px.md} py-1 text-sm leading-6 text-gray-900 dark:text-gray-200 ${cc.transition.colors}`
                )}
              >
                <div className="flex items-center">
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400 flex-shrink-0" aria-hidden="true" />
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