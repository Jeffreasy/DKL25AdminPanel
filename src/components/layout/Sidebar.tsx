import { useSidebar } from '../../contexts/SidebarContext'
import { navigation, NavigationItem } from '../../types/navigation'
import { Link } from 'react-router-dom'

export function Sidebar() {
  const { isCollapsed } = useSidebar()

  return (
    <aside className={`bg-[#1B2B3A] ${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300`}>
      <div className="p-4">
        <img 
          src="https://res.cloudinary.com/dgfuv7wif/image/upload/v1733267882/664b8c1e593a1e81556b4238_0760849fb8_yn6vdm.png" 
          alt="Logo" 
          className="h-8 w-auto" 
        />
      </div>
      <nav className="mt-4">
        {navigation.map((item: NavigationItem) => (
          <Link
            key={item.name}
            to={item.href}
            className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700"
          >
            <item.icon className="h-5 w-5" />
            {!isCollapsed && <span className="ml-3">{item.name}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  )
} 