import { NavLink } from 'react-router-dom'
import { menuItems } from '../../types/navigation'
import { componentClasses as cc } from '../../styles/shared'
import { cl } from '../../styles/shared'

export function Navigation() {
  return (
    <nav className={cc.sidebar.content.section}>
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }: { isActive: boolean }) => cl(
            cc.sidebar.item.base,
            isActive ? cc.sidebar.item.active : cc.sidebar.item.inactive
          )}
        >
          <item.icon 
            className={cl(
              cc.sidebar.item.icon.base,
              cc.sidebar.item.icon.inactive
            )} 
          />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
} 