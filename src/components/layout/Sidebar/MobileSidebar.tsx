import React, { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { SidebarContent } from './SidebarContent'
import { cc } from '../../../styles/shared'

interface MobileSidebarProps {
  isMobileOpen: boolean;
  setMobileOpen: (isOpen: boolean) => void;
}

export function MobileSidebar({ isMobileOpen, setMobileOpen }: MobileSidebarProps) {
  const closeSidebar = () => setMobileOpen(false);

  return (
    <Transition.Root show={isMobileOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40 md:hidden" onClose={closeSidebar}>
        <Transition.Child
          as={Fragment}
          enter={cc.transition.slow}
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave={cc.transition.slow}
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={`fixed inset-0 ${cc.overlay.medium}`} />
        </Transition.Child>

        <div className="fixed inset-0 flex z-40">
          <Transition.Child
            as={Fragment}
            enter={`${cc.transition.slow} transform`}
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave={`${cc.transition.slow} transform`}
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800 dark:bg-gray-900">
              <div className="absolute top-0 right-0 pt-2 pr-4">
                <button
                  type="button"
                  className={`${cc.button.icon({ color: 'secondary' })} h-8 w-8 text-gray-300 dark:text-gray-400 hover:bg-gray-700 dark:hover:bg-gray-800`}
                  onClick={closeSidebar}
                  aria-label="Close sidebar"
                >
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              <SidebarContent variant="mobile" onClose={closeSidebar} />
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}