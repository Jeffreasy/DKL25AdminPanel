import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Combobox } from '@headlessui/react'

interface SearchItem {
  id: string
  name: string
  href: string
  section: string
}

// Alle zoekbare items
const searchItems: SearchItem[] = [
  { id: '1', name: 'Dashboard', href: '/dashboard', section: 'Algemeen' },
  { id: '2', name: "Foto's", href: '/photos', section: 'Media' },
  { id: '3', name: 'Albums', href: '/albums', section: 'Media' },
  { id: '4', name: "Video's", href: '/videos', section: 'Media' },
  { id: '5', name: 'Partners', href: '/partners', section: 'Relaties' },
  { id: '6', name: 'Sponsors', href: '/sponsors', section: 'Relaties' },
  { id: '7', name: 'Profiel', href: '/profile', section: 'Account' },
  { id: '8', name: 'Instellingen', href: '/settings', section: 'Account' },
]

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const searchRef = useRef<HTMLDivElement>(null)
  const [selectedItem, setSelectedItem] = useState<SearchItem | null>(null)

  // Filter items based on search query
  const filteredItems = query === ''
    ? []
    : searchItems.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.section.toLowerCase().includes(query.toLowerCase())
      )

  // Group items by section
  const groupedItems = filteredItems.reduce((groups, item) => {
    const section = item.section
    if (!groups[section]) {
      groups[section] = []
    }
    groups[section].push(item)
    return groups
  }, {} as Record<string, SearchItem[]>)

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      } else if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={searchRef} className="w-full max-w-lg lg:max-w-xs">
      <Combobox
        as="div"
        value={selectedItem}
        onChange={(item: SearchItem | null) => {
          if (item) {
            setSelectedItem(item)
            navigate(item.href)
            setIsOpen(false)
            setQuery('')
          }
        }}
      >
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          </div>
          <Combobox.Input
            className="block w-full rounded-md border-0 bg-white dark:bg-gray-700 py-1.5 pl-10 pr-3 text-gray-900 dark:text-gray-200 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6"
            placeholder="Zoeken... (Ctrl + K)"
            onChange={(e) => setQuery(e.target.value)}
            value={query}
            onFocus={() => setIsOpen(true)}
          />
        </div>

        {isOpen && filteredItems.length > 0 && (
          <Combobox.Options className="absolute z-50 mt-2 max-h-96 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none sm:text-sm">
            {Object.entries(groupedItems).map(([section, items]) => (
              <div key={section}>
                <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700 px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {section}
                </div>
                {items.map((item) => (
                  <Combobox.Option
                    key={item.id}
                    value={item}
                    className={({ active }) => `
                      relative cursor-default select-none py-2 pl-10 pr-4
                      ${active ? 'bg-indigo-600 text-white dark:bg-indigo-500' : 'text-gray-900 dark:text-gray-200'}
                    `}
                  >
                    {({ active }) => (
                      <>
                        <span className={`block truncate ${active ? 'font-semibold' : ''}`}>
                          {item.name}
                        </span>
                      </>
                    )}
                  </Combobox.Option>
                ))}
              </div>
            ))}
          </Combobox.Options>
        )}
      </Combobox>
    </div>
  )
} 