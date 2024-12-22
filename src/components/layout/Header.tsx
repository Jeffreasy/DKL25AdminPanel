import { Bars3Icon } from '@heroicons/react/24/outline'
import { useSidebar } from '../../contexts/SidebarContext'
import { UserMenu } from './UserMenu'
import DKLLogo from '../../assets/DKLLogo.png'

export function Header() {
  const { setMobileOpen } = useSidebar()

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Hamburger menu voor mobiel */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Logo voor mobiel */}
      <div className="flex md:hidden">
        <img
          className="h-8 w-auto"
          src={DKLLogo}
          alt="DKL25"
        />
      </div>

      {/* Rechter sectie met user menu */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
        <UserMenu />
      </div>
    </div>
  )
} 