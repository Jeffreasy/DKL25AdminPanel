import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@mantine/core'
import { rbacClient, type Role } from '../../../api/client'
import { userService } from '../services/userService'
import type { User } from '../types'
import { cc } from '../../../styles/shared'

interface BulkRoleOperationsProps {
  isOpen: boolean
  onClose: () => void
}

export function BulkRoleOperations({ isOpen, onClose }: BulkRoleOperationsProps) {
  const queryClient = useQueryClient()
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [operation, setOperation] = useState<'assign' | 'remove'>('assign')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers(),
    enabled: isOpen
  })

  // Fetch all roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rbacClient.getRoles(),
    enabled: isOpen
  })

  // Filter users by search
  const filteredUsers = users.filter((user: User) =>
    user.naam.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Bulk assign mutation
  const bulkAssignMutation = useMutation({
    mutationFn: async ({ userIds, roleId }: { userIds: string[]; roleId: string }) => {
      const results = await Promise.allSettled(
        userIds.map(userId => rbacClient.assignRoleToUser(userId, roleId))
      )
      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['userRoles'] })
      resetForm()
    }
  })

  // Bulk remove mutation
  const bulkRemoveMutation = useMutation({
    mutationFn: async ({ userIds, roleId }: { userIds: string[]; roleId: string }) => {
      const results = await Promise.allSettled(
        userIds.map(userId => rbacClient.removeRoleFromUser(userId, roleId))
      )
      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['userRoles'] })
      resetForm()
    }
  })

  const handleToggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleToggleAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((u: User) => u.id))
    }
  }

  const handleSubmit = async () => {
    if (!selectedRole || selectedUsers.length === 0) return

    if (operation === 'assign') {
      await bulkAssignMutation.mutateAsync({ userIds: selectedUsers, roleId: selectedRole })
    } else {
      await bulkRemoveMutation.mutateAsync({ userIds: selectedUsers, roleId: selectedRole })
    }
  }

  const resetForm = () => {
    setSelectedUsers([])
    setSelectedRole('')
    setSearchQuery('')
    onClose()
  }

  const isLoading = usersLoading || rolesLoading
  const isMutating = bulkAssignMutation.isPending || bulkRemoveMutation.isPending
  const canSubmit = selectedUsers.length > 0 && selectedRole && !isMutating

  return (
    <Modal
      opened={isOpen}
      onClose={resetForm}
      title="Bulk Rol Operaties"
      size="xl"
    >
      <div className={cc.spacing.section.md}>
        {/* Operation Type Selector */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Operatie Type
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setOperation('assign')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                operation === 'assign'
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              Rol Toewijzen
            </button>
            <button
              onClick={() => setOperation('remove')}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                operation === 'remove'
                  ? 'bg-red-600 dark:bg-red-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
              }`}
            >
              Rol Verwijderen
            </button>
          </div>
        </div>

        {/* Role Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Selecteer Rol
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className={cc.form.select()}
            disabled={isLoading || isMutating}
          >
            <option value="">-- Kies een rol --</option>
            {roles.map((role: Role) => (
              <option key={role.id} value={role.id}>
                {role.name} {role.is_system_role ? '(Systeem)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* User Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Selecteer Gebruikers ({selectedUsers.length} geselecteerd)
            </label>
            <button
              onClick={handleToggleAll}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              disabled={isLoading || isMutating}
            >
              {selectedUsers.length === filteredUsers.length ? 'Deselecteer alles' : 'Selecteer alles'}
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Zoek gebruikers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              disabled={isLoading || isMutating}
            />
          </div>

          {/* Users List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Geen gebruikers gevonden
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user: User) => (
                    <label
                      key={user.id}
                      className={`flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer ${
                        !user.is_actief ? 'opacity-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleToggleUser(user.id)}
                        disabled={!user.is_actief || isMutating}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.naam}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email} • {user.rol}
                        </p>
                      </div>
                      {!user.is_actief && (
                        <span className={cc.badge({ color: 'gray', className: 'text-xs' })}>
                          Inactief
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary & Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          {/* Summary */}
          {canSubmit && (
            <div className={`mb-4 p-4 rounded-lg ${
              operation === 'assign'
                ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
            }`}>
              <p className={`text-sm font-medium ${
                operation === 'assign'
                  ? 'text-blue-900 dark:text-blue-200'
                  : 'text-red-900 dark:text-red-200'
              }`}>
                {operation === 'assign' ? '✓' : '×'} {selectedUsers.length} gebruiker(s) {
                  operation === 'assign' ? 'krijgen rol' : 'verliezen rol'
                } "{roles.find((r: Role) => r.id === selectedRole)?.name}"
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={resetForm}
              className={cc.button.base({ color: 'secondary' })}
              disabled={isMutating}
            >
              Annuleren
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={cc.button.base({ 
                color: operation === 'assign' ? 'primary' : 'danger',
                className: `${cc.spacing.gap.sm} ${!canSubmit ? 'opacity-50 cursor-not-allowed' : ''}` 
              })}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isMutating ? 'Verwerken...' : `${operation === 'assign' ? 'Toewijzen' : 'Verwijderen'}`}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}