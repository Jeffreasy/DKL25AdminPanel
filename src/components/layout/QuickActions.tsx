import { Fragment, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { useNavigate } from 'react-router-dom'
import {
  PlusIcon,
  PhotoIcon,
  UserPlusIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  FolderPlusIcon,
} from '@heroicons/react/24/outline'
import { SponsorForm } from '../../features/sponsors/components/SponsorForm'
import { PhotoForm } from '../../features/photos/components/PhotoForm'
import { AlbumForm } from '../../features/albums/components/AlbumForm'
import { PartnerForm } from '../../features/partners/components/PartnerForm'

const quickActions = [
  {
    name: "Foto's toevoegen",
    description: 'Upload nieuwe foto\'s naar de galerij',
    action: 'photos',
    icon: PhotoIcon,
  },
  {
    name: 'Album maken',
    description: 'Maak een nieuw fotoalbum aan',
    action: 'albums',
    icon: FolderPlusIcon,
  },
  {
    name: 'Partner toevoegen',
    description: 'Voeg een nieuwe partner toe',
    action: 'partners',
    icon: UserPlusIcon,
  },
  {
    name: 'Sponsor toevoegen',
    description: 'Registreer een nieuwe sponsor',
    action: 'sponsors',
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
  const [showSponsorForm, setShowSponsorForm] = useState(false)
  const [showPhotoForm, setShowPhotoForm] = useState(false)
  const [showAlbumForm, setShowAlbumForm] = useState(false)
  const [showPartnerForm, setShowPartnerForm] = useState(false)

  const handleAction = (action: string | undefined, href: string | undefined) => {
    if (href) {
      navigate(href)
      return
    }

    switch (action) {
      case 'sponsors':
        setShowSponsorForm(true)
        break
      case 'photos':
        setShowPhotoForm(true)
        break
      case 'albums':
        setShowAlbumForm(true)
        break
      case 'partners':
        setShowPartnerForm(true)
        break
    }
  }

  return (
    <>
      <Menu as="div" className="relative">
        <Menu.Button className="rounded-full p-1 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
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
          <Menu.Items className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none sm:w-96">
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Snelle acties</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Voer snel taken uit</p>
            </div>

            <div className="mt-2 divide-y divide-gray-100 dark:divide-gray-700">
              {quickActions.map((action) => (
                <Menu.Item key={action.name}>
                  {({ active }) => (
                    <button
                      onClick={() => handleAction(action.action, action.href)}
                      className={`
                        flex w-full items-center px-4 py-3 text-left
                        ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}
                      `}
                    >
                      <action.icon
                        className="h-6 w-6 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                      />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {action.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
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

      {showSponsorForm && (
        <SponsorForm
          onComplete={() => setShowSponsorForm(false)}
          onCancel={() => setShowSponsorForm(false)}
        />
      )}
      {showPhotoForm && (
        <PhotoForm
          onComplete={() => setShowPhotoForm(false)}
          onCancel={() => setShowPhotoForm(false)}
        />
      )}
      {showAlbumForm && (
        <AlbumForm
          onComplete={() => setShowAlbumForm(false)}
          onCancel={() => setShowAlbumForm(false)}
        />
      )}
      {showPartnerForm && (
        <PartnerForm
          onComplete={() => setShowPartnerForm(false)}
          onCancel={() => setShowPartnerForm(false)}
        />
      )}
    </>
  )
} 