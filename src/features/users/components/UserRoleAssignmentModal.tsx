import { useState, useEffect, useMemo } from 'react'
import { Modal } from '@mantine/core'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rbacClient, type Role, type UserRole } from '../../../api/client'
import type { User } from '../types'
import { cc } from '../../../styles/shared'
import { getErrorMessage, getErrorCode } from '../../../utils/apiErrorHandler'
import toast from 'react-hot-toast'

interface UserRoleAssignmentModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
}

export function UserRoleAssignmentModal({ user, isOpen, onClose }: UserRoleAssignmentModalProps) {
  const queryClient = useQueryClient()
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])

  // Fetch all available roles
  const { data: allRoles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rbacClient.getRoles(),
    enabled: isOpen
  })

  // Fetch user's current roles
  const {
    data: userRoles = [],
    isLoading: userRolesLoading,
    error: userRolesError
  } = useQuery({
    queryKey: ['userRoles', user?.id],
    queryFn: () => user ? rbacClient.getUserRoles(user.id) : Promise.resolve([]),
    enabled: isOpen && !!user,
    retry: 1
  })

  // Log error details for debugging
  useEffect(() => {
    if (userRolesError) {
      const message = getErrorMessage(userRolesError)
      const code = getErrorCode(userRolesError)
      console.error('❌ Failed to load user roles:', {
        userId: user?.id,
        message,
        code,
        error: userRolesError
      })
    }
  }, [userRolesError, user?.id])

  // Stable user role IDs string for comparison
  const userRoleIdsString = useMemo(
    () => userRoles.map((ur: UserRole) => ur.role_id).sort().join(','),
    [userRoles]
  )

  // Initialize selected roles only when modal opens or user roles change
  useEffect(() => {
    if (isOpen && userRoleIdsString) {
      setSelectedRoleIds(userRoleIdsString.split(',').filter(Boolean))
    } else if (isOpen && userRoles.length === 0) {
      setSelectedRoleIds([])
    }
  }, [isOpen, userRoleIdsString])

  // Mutation for assigning role
  const assignMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      rbacClient.assignRoleToUser(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRoles', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Rol succesvol toegewezen')
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      const code = getErrorCode(error)
      console.error('❌ Assign role failed:', { message, code, error })
      toast.error(`Rol toewijzen mislukt: ${message}`)
    }
  })

  // Mutation for removing role
  const removeMutation = useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      rbacClient.removeRoleFromUser(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRoles', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Rol succesvol verwijderd')
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      const code = getErrorCode(error)
      console.error('❌ Remove role failed:', { message, code, error })
      toast.error(`Rol verwijderen mislukt: ${message}`)
    }
  })

  const handleToggleRole = async (roleId: string) => {
    if (!user) return

    const isCurrentlySelected = selectedRoleIds.includes(roleId)

    if (isCurrentlySelected) {
      // Remove role
      await removeMutation.mutateAsync({ userId: user.id, roleId })
      setSelectedRoleIds(prev => prev.filter(id => id !== roleId))
    } else {
      // Assign role
      await assignMutation.mutateAsync({ userId: user.id, roleId })
      setSelectedRoleIds(prev => [...prev, roleId])
    }
  }

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
    onClose()
  }

  const isLoading = rolesLoading || userRolesLoading
  const isMutating = assignMutation.isPending || removeMutation.isPending

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={`Rollen Beheren - ${user?.naam || 'Gebruiker'}`}
      size="lg"
    >
      <div className={cc.spacing.section.md}>
        {/* User Info */}
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-800 rounded-lg p-2">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{user?.naam}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {userRolesError && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 dark:text-red-200 mb-1">
                  Backend Error (500)
                </h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                  {getErrorMessage(userRolesError)}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 font-mono mb-2">
                  Error code: {getErrorCode(userRolesError) || 'HTTP_500'}
                </p>
                <details className="text-xs text-red-600 dark:text-red-400">
                  <summary className="cursor-pointer hover:text-red-700 dark:hover:text-red-300 mb-1">
                    Technische details (voor developers)
                  </summary>
                  <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/50 rounded border border-red-200 dark:border-red-800">
                    <p className="mb-1">
                      <strong>Endpoint:</strong> GET /api/users/{user?.id}/roles
                    </p>
                    <p className="mb-1">
                      <strong>User ID:</strong> {user?.id}
                    </p>
                    <p>
                      <strong>Mogelijke oorzaken:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                      <li>Backend RBAC endpoints zijn niet correct geïmplementeerd</li>
                      <li>Database user_roles table bestaat niet of heeft verkeerde schema</li>
                      <li>Permission checks in backend falen</li>
                      <li>Backend V1.49 updates zijn niet compleet</li>
                    </ul>
                    <p className="mt-2 text-xs">
                      Check backend logs voor exacte error details
                    </p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        ) : !userRolesError && (
          <>
            {/* Roles List */}
            <div className={cc.spacing.section.md}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Beschikbare Rollen
              </h3>
              
              <div className="space-y-2">
                {allRoles.map((role: Role) => {
                  const isSelected = selectedRoleIds.includes(role.id)
                  const isSystemRole = role.is_system_role

                  return (
                    <div
                      key={role.id}
                      className={`border rounded-lg p-4 transition-all ${
                        isSelected
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      } ${!isMutating ? 'hover:border-blue-300 dark:hover:border-blue-600' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {role.name}
                            </h4>
                            {isSystemRole && (
                              <span className={cc.badge({ color: 'blue' })}>
                                Systeem
                              </span>
                            )}
                          </div>
                          {role.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {role.description}
                            </p>
                          )}
                          {role.permissions && role.permissions.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {role.permissions.slice(0, 3).map(perm => (
                                <span key={perm.id} className={cc.badge({ color: 'gray', className: 'text-xs' })}>
                                  {perm.resource}:{perm.action}
                                </span>
                              ))}
                              {role.permissions.length > 3 && (
                                <span className={cc.badge({ color: 'gray', className: 'text-xs' })}>
                                  +{role.permissions.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleToggleRole(role.id)}
                          disabled={isMutating}
                          className={`ml-4 flex-shrink-0 w-12 h-6 rounded-full transition-colors ${
                            isSelected
                              ? 'bg-blue-600 dark:bg-blue-500'
                              : 'bg-gray-300 dark:bg-gray-600'
                          } ${isMutating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} relative`}
                        >
                          <span
                            className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform absolute top-1 ${
                              isSelected ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className={cc.button.base({ color: 'secondary' })}
                disabled={isMutating}
              >
                Annuleren
              </button>
              <button
                onClick={handleSave}
                className={cc.button.base({ color: 'primary', className: cc.spacing.gap.sm })}
                disabled={isMutating}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Opslaan
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}