import { Fragment, useState, useMemo, useCallback, lazy, Suspense } from 'react'
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

// Lazy load heavy components
const SponsorForm = lazy(() => import('../../features/sponsors/components/SponsorForm').then(module => ({ default: module.SponsorForm })))
const PhotoForm = lazy(() => import('../../features/photos/components/PhotoForm').then(module => ({ default: module.PhotoForm })))
const AlbumForm = lazy(() => import('../../features/albums/components/AlbumForm').then(module => ({ default: module.AlbumForm })))
const PartnerForm = lazy(() => import('../../features/partners/components/PartnerForm').then(module => ({ default: module.PartnerForm })))

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
  const [modals, setModals] = useState({
    sponsor: false,
    photo: false,
    album: false,
    partner: false,
  })

  const memoizedQuickActions = useMemo(() => quickActions, [])

  const handleAction = useCallback((action: string | undefined, href: string | undefined) => {
    if (href) {
      navigate(href)
      return
    }

    setModals(prev => ({
      ...prev,
      sponsor: action === 'sponsors',
      photo: action === 'photos',
      album: action === 'albums',
      partner: action === 'partners',
    }))
  }, [navigate])

  const closeModal = useCallback((type: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [type]: false }))
  }, [])

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
          <Menu.Items className="fixed inset-x-2 top-16 z-50 w-auto min-w-[280px] max-w-sm rounded-md bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:max-w-none sm:w-96 sm:origin-top-right sm:inset-x-auto">
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Snelle acties</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Voer snel taken uit</p>
            </div>

            <div className="mt-2 divide-y divide-gray-100 dark:divide-gray-700">
              {memoizedQuickActions.map((action) => (
                <Menu.Item key={action.name}>
                  {({ active }) => (
                    <button
                      onClick={() => handleAction(action.action, action.href)}
                      className={`
                        flex w-full items-center px-4 py-4 text-left
                        ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}
                        touch-manipulation sm:px-4 sm:py-3
                      `}
                    >
                      <action.icon
                        className="h-6 w-6 text-gray-500 dark:text-gray-400 flex-shrink-0 sm:h-6 sm:w-6"
                        aria-hidden="true"
                      />
                      <div className="ml-4 min-w-0 flex-1">
                        <p className="text-base font-medium text-gray-900 dark:text-gray-100 sm:text-sm">
                          {action.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-sm">
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

      <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>}>
        {modals.sponsor && (
          <SponsorForm
            onComplete={() => closeModal('sponsor')}
            onCancel={() => closeModal('sponsor')}
          />
        )}
        {modals.photo && (
          <PhotoForm
            onComplete={() => closeModal('photo')}
            onCancel={() => closeModal('photo')}
          />
        )}
        {modals.album && (
          <AlbumForm
            onComplete={() => closeModal('album')}
            onCancel={() => closeModal('album')}
          />
        )}
        {modals.partner && (
          <PartnerForm
            onComplete={() => closeModal('partner')}
            onCancel={() => closeModal('partner')}
          />
        )}
      </Suspense>
    </>
  )
} 