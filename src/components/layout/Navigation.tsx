import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { menuItems, MenuItem, MenuGroup } from '../../types/navigation'
import { componentClasses as cc } from '../../styles/shared'
import { cl } from '../../styles/shared'

export function Navigation() {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupLabel)
        ? prev.filter(label => label !== groupLabel)
        : [...prev, groupLabel]
    )
  }

  const renderMenuItem = (item: MenuItem) => (
    <NavLink
      key={item.path}
      to={item.path}
      className={({ isActive }) => cl(
        cc.sidebar.item.base,
        isActive ? cc.sidebar.item.active : cc.sidebar.item.inactive
      )}
    >
      <item.icon className={cl(
        cc.sidebar.item.icon.base,
        cc.sidebar.item.icon.inactive
      )} />
      <span>{item.label}</span>
    </NavLink>
  )

  const renderMenuGroup = (group: MenuGroup) => {
    const isExpanded = expandedGroups.includes(group.label)
    
    return (
      <div key={group.label} className="space-y-1">
        <button
          onClick={() => toggleGroup(group.label)}
          className={cl(
            cc.sidebar.group.header,
            isExpanded && cc.sidebar.group.expanded
          )}
        >
          <span>{group.label}</span>
          <ChevronDownIcon
            className={cl(
              'h-5 w-5 transition-transform',
              isExpanded ? 'transform rotate-180' : ''
            )}
          />
        </button>
        
        {isExpanded && (
          <div className={cc.sidebar.group.items}>
            {group.items.map(renderMenuItem)}
          </div>
        )}
      </div>
    )
  }

  return (
    <nav className={cc.sidebar.content.section}>
      {menuItems.map(item => 
        'items' in item ? renderMenuGroup(item) : renderMenuItem(item)
      )}
    </nav>
  )
} 