import React, { useState, useEffect, useRef } from 'react'
import { CheckIcon, ChevronDownIcon, MagnifyingGlassIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { userClient, type User } from '@/api/client'
import { cc } from '@/styles/shared'

interface UserSelectProps {
  selectedUsers: string[]
  onChange: (userIds: string[]) => void
  placeholder?: string
  multiple?: boolean
  disabled?: boolean
  className?: string
}

export function UserSelect({
  selectedUsers,
  onChange,
  placeholder = "Zoek gebruikers...",
  multiple = true,
  disabled = false,
  className = ""
}: UserSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([]) // Pre-loaded user list
  const [selectedUserDetails, setSelectedUserDetails] = useState<User[]>([])
  const prevSelectedRef = useRef<string>('')

  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Load all staff and admin users on mount
  useEffect(() => {
    const loadAllUsers = async () => {
      try {
        const allUsersList = await userClient.getUsers(100)
        const userArray = Array.isArray(allUsersList) ? allUsersList : []
        
        // Filter to only show staff and admin
        // Backend uses 'rol' field (Dutch), not 'role' (English)
        const filteredUsers = userArray.filter(user => {
          const userRole = user.rol || user.role
          return userRole === 'staff' || userRole === 'admin'
        })
        
        setAllUsers(filteredUsers)
        setUsers(filteredUsers)
      } catch (error) {
        console.error('Failed to load users:', error)
        setAllUsers([])
        setUsers([])
      }
    }

    loadAllUsers()
  }, [])

  // Load selected user details - prevent infinite loops with ref tracking
  useEffect(() => {
    const loadSelectedUsers = async () => {
      // Ensure we have a valid array
      const userIds = Array.isArray(selectedUsers) ? selectedUsers : []
      const currentSerialized = JSON.stringify([...userIds].sort())
      
      // Only load if the selection actually changed
      if (currentSerialized === prevSelectedRef.current) {
        return
      }
      
      prevSelectedRef.current = currentSerialized

      if (userIds.length === 0) {
        setSelectedUserDetails([])
        return
      }

      try {
        const userPromises = userIds.map(id => userClient.getUserById(id))
        const userDetails = await Promise.all(userPromises)
        setSelectedUserDetails(userDetails.filter(Boolean))
      } catch (error) {
        console.error('Failed to load selected users:', error)
        setSelectedUserDetails([])
      }
    }

    loadSelectedUsers()
  }, [selectedUsers])

  // Filter users based on search query - always show full list if no search
  useEffect(() => {
    if (!searchQuery || searchQuery.length === 0) {
      // Show all users when no search query
      setUsers(allUsers)
      return
    }

    // Filter locally based on search
    const filtered = allUsers.filter(user =>
      user.naam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setUsers(filtered)
  }, [searchQuery, allUsers])


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectUser = (user: User) => {
    if (disabled) return

    // Ensure we work with a valid array
    const currentSelected = Array.isArray(selectedUsers) ? selectedUsers : []
    let newSelected: string[]

    if (multiple) {
      if (currentSelected.includes(user.id)) {
        newSelected = currentSelected.filter(id => id !== user.id)
      } else {
        newSelected = [...currentSelected, user.id]
      }
    } else {
      newSelected = currentSelected.includes(user.id) ? [] : [user.id]
      setIsOpen(false)
    }

    onChange(newSelected)
    setSearchQuery('')
  }

  const handleRemoveUser = (userId: string) => {
    if (disabled) return
    const currentSelected = Array.isArray(selectedUsers) ? selectedUsers : []
    onChange(currentSelected.filter(id => id !== userId))
  }

  const handleOpenDropdown = () => {
    if (disabled) return
    setIsOpen(true)
    // Reset search and show all users when opening
    setSearchQuery('')
    setUsers(allUsers)
    setTimeout(() => searchInputRef.current?.focus(), 0)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Selected users display */}
      {selectedUserDetails.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedUserDetails.map((user) => (
            <span
              key={user.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
            >
              <UserIcon className="w-3 h-3" />
              {user.naam}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveUser(user.id)}
                  className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={handleOpenDropdown}
        disabled={disabled}
        className={cc.form.input() + ' flex items-center justify-between cursor-pointer'}
      >
        <span className="truncate">
          {!Array.isArray(selectedUsers) || selectedUsers.length === 0
            ? placeholder
            : multiple
              ? `${selectedUsers.length} gebruiker${selectedUsers.length !== 1 ? 's' : ''} geselecteerd`
              : selectedUserDetails[0]?.naam || 'Gebruiker selecteren...'
          }
        </span>
        <ChevronDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Zoek gebruikers..."
                className={cc.form.input() + ' pl-9'}
              />
            </div>
          </div>

          {/* User list */}
          <div className="py-1">
            {users.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Geen gebruikers gevonden' : 'Geen staff/admin gebruikers beschikbaar'}
              </div>
            ) : (
              users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectUser(user)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                >
                  <div className="flex-shrink-0">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.naam}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {user.naam}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </div>
                  </div>
                  {Array.isArray(selectedUsers) && selectedUsers.includes(user.id) && (
                    <CheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}