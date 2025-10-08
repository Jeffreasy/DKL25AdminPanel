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
import { usePermissions } from '../../hooks/usePermissions'
import { cc } from '../../styles/shared'

const SponsorForm = lazy(() => import('../../features/sponsors/components/SponsorForm').then(module => ({ default: module.SponsorForm })))
const PhotoForm = lazy(() => import('../../features/photos/components/forms/PhotoForm').then(module => ({ default: module.PhotoForm })))
const AlbumForm = lazy(() => import('../../features/albums/components/forms/AlbumForm').then(module => ({ default: module.AlbumForm })))
const PartnerForm = lazy(() => import('../../features/partners/components/PartnerForm').then(module => ({ default: module.PartnerForm })))

const quickActions = [
  {
    name: "Foto's toevoegen",
    description: 'Upload nieuwe foto\'s naar de galerij',
    action: 'photos',
    icon: PhotoIcon,
    permission: 'photo:write',
  },
  {
    name: 'Album maken',
    description: 'Maak een nieuw fotoalbum aan',
    action: 'albums',
    icon: FolderPlusIcon,
    permission: 'album:write',
  },
  {
    name: 'Partner toevoegen',
    description: 'Voeg een nieuwe partner toe',
    action: 'partners',
    icon: UserPlusIcon,
    permission: 'partner:write',
  },
  {
    name: 'Sponsor toevoegen',
    description: 'Registreer een nieuwe sponsor',
    action: 'sponsors',
    icon: CurrencyDollarIcon,
    permission: 'sponsor:write',
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
  const { hasPermission } = usePermissions()
  const [modals, setModals] = useState({
    sponsor: false,
    photo: false,
    album: false,
    partner: false,
  })

  const memoizedQuickActions = useMemo(() =>
    quickActions.filter(action =>
      !action.permission || hasPermission(action.permission.split(':')[0], action.permission.split(':')[1])
    ), [hasPermission])

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
        <Menu.Button className={`rounded-full p-1 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${cc.transition.colors}`}>
          <span className="sr-only">Open snelle acties</span>
          <PlusIcon className="h-6 w-6" aria-hidden="true" />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter={`${cc.transition.normal} ease-out`}
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave={`${cc.transition.fast} ease-in`}
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className={`fixed inset-x-2 top-16 z-50 w-auto min-w-[280px] max-w-sm rounded-md bg-white dark:bg-gray-800 ${cc.spacing.py.sm} shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:max-w-none sm:w-96 sm:origin-top-right sm:inset-x-auto`}>
            <div className={`${cc.spacing.px.sm} ${cc.spacing.py.sm} border-b border-gray-100 dark:border-gray-700`}>
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
                        flex w-full items-center ${cc.spacing.px.sm} py-4 text-left ${cc.transition.colors}
                        ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}
                        touch-manipulation sm:${cc.spacing.px.sm} sm:py-3
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

      <Suspense fallback={<div className={`fixed inset-0 ${cc.overlay.medium} flex items-center justify-center z-50`}><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>}>
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