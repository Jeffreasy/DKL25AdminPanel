import { useState } from 'react'
import { useMutation, useQueryClient, useQueries } from '@tanstack/react-query'
import { Modal, Text } from '@mantine/core'
import { roleService } from '../services/roleService'
import { permissionService } from '../services/permissionService'
import { RoleForm } from './RoleForm'
import type { Role, CreateRoleRequest } from '../types'
import { cc } from '../../../styles/shared'

export function RoleList() {
  const queryClient = useQueryClient()
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const queries = useQueries({
    queries: [
      {
        queryKey: ['roles'],
        queryFn: () => roleService.getRoles(),
        retry: 1,
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['permissions'],
        queryFn: () => permissionService.getPermissions(),
        retry: 1,
        staleTime: 5 * 60 * 1000,
      }
    ]
  });

  const [rolesQuery, permissionsQuery] = queries;
  const roles = rolesQuery.data || [];
  const isLoading = rolesQuery.isLoading || permissionsQuery.isLoading;
  const hasError = rolesQuery.error || permissionsQuery.error;

  const enrichedRoles = roles.map(role => ({
    ...role,
    permissions: role.permissions || []
  }));

  const filteredRoles = enrichedRoles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: roleService.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      setIsModalOpen(false)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Role> }) => roleService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      setIsModalOpen(false)
      setSelectedRole(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: roleService.deleteRole,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] })
  })

  const updatePermissionsMutation = useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }) =>
      roleService.assignPermissionsToRole(roleId, permissionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      setIsModalOpen(false)
      setSelectedRole(null)
    }
  })

  const handleAdd = () => {
    setSelectedRole(null)
    setIsModalOpen(true)
  }

  const handleEdit = (role: Role) => {
    setSelectedRole(role)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Weet je zeker dat je deze rol wilt verwijderen?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSubmit = async (values: CreateRoleRequest) => {
    if (selectedRole) {
      await updateMutation.mutateAsync({ id: selectedRole.id, data: values })
    } else {
      await createMutation.mutateAsync(values)
    }
  }

  const handlePermissionUpdate = async (roleId: string, permissionIds: string[]) => {
    await updatePermissionsMutation.mutateAsync({ roleId, permissionIds })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    )
  }

  if (hasError) {
    const rolesError = rolesQuery.error as Error;
    const permissionsError = permissionsQuery.error as Error;

    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600/50 rounded-lg p-6">
        <div className={`flex items-start ${cc.spacing.gap.md}`}>
          <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <Text className="font-semibold text-red-900 dark:text-red-300 mb-2">Fout bij laden rollen en permissies</Text>
            {rolesError && (
              <Text className="text-sm text-red-700 dark:text-red-400 mb-1">
                Rollen: {rolesError.message}
              </Text>
            )}
            {permissionsError && (
              <Text className="text-sm text-red-700 dark:text-red-400 mb-3">
                Permissies: {permissionsError.message}
              </Text>
            )}
            <Text className="text-xs text-red-600 dark:text-red-400">
              Mogelijke oorzaken: Backend endpoints niet geïmplementeerd, CORS configuratie problemen, Authenticatie problemen, Netwerk problemen
            </Text>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cc.spacing.section.md}>
      {/* Search and Add Button */}
      <div className={`flex flex-col sm:flex-row ${cc.spacing.gap.lg} items-start sm:items-center justify-between`}>
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Zoek rollen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        <button
          onClick={handleAdd}
          className={cc.button.base({ color: 'primary', className: cc.spacing.gap.sm })}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nieuwe Rol
        </button>
      </div>

      {/* Roles Grid */}
      {filteredRoles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Geen rollen gevonden</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
            {searchQuery ? 'Probeer een andere zoekopdracht' : 'Klik op "Nieuwe Rol" om te beginnen'}
          </p>
        </div>
      ) : (
        <div className={`${cc.grid.userCards()} ${cc.spacing.gap.xl}`}>
          {filteredRoles.map(role => (
            <div
              key={role.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${cc.hover.card} ${cc.transition.shadow} overflow-hidden group`}
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 ${cc.spacing.container.sm}`}>
                <div className={`flex items-start justify-between ${cc.spacing.gap.md}`}>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-1">{role.name}</h3>
                    <p className="text-blue-100 dark:text-blue-200 text-sm line-clamp-2">
                      {role.description || 'Geen beschrijving'}
                    </p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-2 flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className={`${cc.spacing.container.sm} ${cc.spacing.section.sm}`}>
                {/* Permissions */}
                <div>
                  <div className={`flex items-center ${cc.spacing.gap.sm} mb-2`}>
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Permissies</span>
                  </div>
                  {role.permissions && role.permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 4).map(permission => (
                        <span
                          key={permission.id}
                          className={cc.badge({ color: 'blue' })}
                        >
                          {permission.resource}:{permission.action}
                        </span>
                      ))}
                      {role.permissions.length > 4 && (
                        <span className={cc.badge({ color: 'gray' })}>
                          +{role.permissions.length - 4} meer
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">Geen permissies toegewezen</p>
                  )}
                </div>

                {/* Metadata */}
                <div className={`flex items-center ${cc.spacing.gap.sm} text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Aangemaakt: {new Date(role.created_at).toLocaleDateString('nl-NL')}</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className={`${cc.spacing.px.sm} ${cc.spacing.py.md} bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex ${cc.spacing.gap.sm}`}>
                <button
                  onClick={() => handleEdit(role)}
                  className={cc.button.base({ color: 'secondary', className: `flex-1 ${cc.spacing.gap.sm}` })}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Bewerken
                </button>
                <button
                  onClick={() => handleDelete(role.id)}
                  className={cc.button.icon({ color: 'danger' })}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedRole ? 'Rol Permissies Bewerken' : 'Nieuwe Rol'}
        size="lg"
      >
        <RoleForm
          initialValues={selectedRole ?? undefined}
          onSubmit={handleSubmit}
          onPermissionUpdate={handlePermissionUpdate}
          isSubmitting={createMutation.isPending || updateMutation.isPending || updatePermissionsMutation.isPending}
        />
      </Modal>
    </div>
  )
}