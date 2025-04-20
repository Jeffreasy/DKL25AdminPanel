import React, { Fragment } from 'react'
// Import Dialog from Headless UI
import { Dialog, Transition } from '@headlessui/react'
// Import XMarkIcon for the new close button
import { XMarkIcon } from '@heroicons/react/24/outline'
import { SidebarContent } from './SidebarContent'

interface MobileSidebarProps {
  isMobileOpen: boolean;
  setMobileOpen: (isOpen: boolean) => void;
}

export function MobileSidebar({ isMobileOpen, setMobileOpen }: MobileSidebarProps) {
  const closeSidebar = () => setMobileOpen(false);

  return (
    // Use Transition.Root with Dialog for coordinated animations
    <Transition.Root show={isMobileOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40 md:hidden" onClose={closeSidebar}>
        {/* Backdrop Transition */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Dialog.Overlay handles the backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        {/* Main Panel Container */}
        <div className="fixed inset-0 flex z-40">
          {/* Panel Transition */}
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            {/* Dialog.Panel contains the sidebar content and the new close button */}
            <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
              {/* Close Button - Moved INSIDE the panel */}
              <div className="absolute top-0 right-0 pt-2 pr-4">
                <button
                  type="button"
                  className="flex items-center justify-center h-8 w-8 rounded-md text-gray-300 dark:text-gray-400 hover:bg-gray-700 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={closeSidebar}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              {/* Render SidebarContent, still passing onClose for link clicks */}
              <SidebarContent variant="mobile" onClose={closeSidebar} />
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
} 