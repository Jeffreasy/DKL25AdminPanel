import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { useNavigate } from 'react-router-dom'
import {
  PlusIcon,
  PhotoIcon,
  UserPlusIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'

const quickActions = [
  {
    name: "Foto's toevoegen",
    description: 'Upload nieuwe foto\'s naar de galerij',
    href: '/photos/upload',
    icon: PhotoIcon,
  },
  {
    name: 'Partner toevoegen',
    description: 'Voeg een nieuwe partner toe',
    href: '/partners/new',
    icon: UserPlusIcon,
  },
  {
    name: 'Sponsor toevoegen',
    description: 'Registreer een nieuwe sponsor',
    href: '/sponsors/new',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Instellingen',
    description: 'Beheer je account instellingen',
    href: '/settings',
    icon: Cog6ToothIcon,
  },
]

export function QuickActions() {
  const navigate = useNavigate()

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
        <span className="sr-only">Open snelle acties</span>
        <PlusIcon className="h-6 w-6" aria-hidden="true" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-96 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-2">
            <p className="text-sm font-medium text-gray-900">Snelle acties</p>
            <p className="text-sm text-gray-500">Voer snel taken uit</p>
          </div>

          <div className="mt-2 divide-y divide-gray-100">
            {quickActions.map((action) => (
              <Menu.Item key={action.name}>
                {({ active }) => (
                  <button
                    onClick={() => navigate(action.href)}
                    className={`
                      flex w-full items-center px-4 py-3 text-left
                      ${active ? 'bg-gray-50' : ''}
                    `}
                  >
                    <action.icon
                      className="h-6 w-6 text-gray-400"
                      aria-hidden="true"
                    />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {action.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {action.description}
                      </p>
                    </div>
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
} 