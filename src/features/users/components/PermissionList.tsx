import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal, Text } from '@mantine/core'
import { rbacClient, type Permission } from '../../../api/client'
import { PermissionForm } from './PermissionForm'
import { useFilters, applyFilters } from '../../../hooks/useFilters'
import type { CreatePermissionRequest } from '../types'
import { cc } from '../../../styles/shared'

export function PermissionList() {
  const queryClient = useQueryClient()
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Use filters hook
  const filters = useFilters<'search' | 'type'>({
    initialFilters: {
      search: '',
      type: 'all'
    }
  })

  const { data: permissions = { groups: [], total: 0 }, isLoading, error } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => rbacClient.getPermissions(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })

  // Apply filters to groups
  const filteredGroups = useMemo(() => {
    return permissions.groups.map(group => ({
      ...group,
      permissions: applyFilters(group.permissions, filters.filters, (permission, filterValues) => {
        // Search filter
        if (filterValues.search) {
          const searchTerm = (filterValues.search as string).toLowerCase()
          const matchesSearch =
            permission.resource.toLowerCase().includes(searchTerm) ||
            permission.action.toLowerCase().includes(searchTerm) ||
            permission.description?.toLowerCase().includes(searchTerm)
          if (!matchesSearch) return false
        }

        // Type filter
        if (filterValues.type && filterValues.type !== 'all') {
          if (filterValues.type === 'system' && !permission.is_system_permission) return false
          if (filterValues.type === 'custom' && permission.is_system_permission) return false
        }

        return true
      })
    })).filter(group => group.permissions.length > 0)
  }, [permissions.groups, filters.filters])

  const createMutation = useMutation({
    mutationFn: (data: CreatePermissionRequest) => rbacClient.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] })
      setIsModalOpen(false)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ data }: { data: Partial<Permission> }) => rbacClient.createPermission(data as CreatePermissionRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] })
      setIsModalOpen(false)
      setSelectedPermission(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => rbacClient.deletePermission(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['permissions'] })
  })

  const handleAdd = () => {
    setSelectedPermission(null)
    setIsModalOpen(true)
  }

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Weet je zeker dat je deze permissie wilt verwijderen?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSubmit = async (values: CreatePermissionRequest | Partial<Permission>) => {
    if (selectedPermission) {
      await updateMutation.mutateAsync({ data: values as Partial<Permission> })
    } else {
      await createMutation.mutateAsync(values as CreatePermissionRequest)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600/50 rounded-lg p-6">
        <div className={`flex items-start ${cc.spacing.gap.md}`}>
          <svg className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <Text className="font-semibold text-red-900 dark:text-red-300 mb-2">Fout bij laden permissies</Text>
            <Text className="text-sm text-red-700 dark:text-red-400 mb-3">{error.message}</Text>
            <Text className="text-xs text-red-600 dark:text-red-400">
              Mogelijke oorzaken: Backend endpoint niet geïmplementeerd, CORS configuratie problemen, Authenticatie problemen
            </Text>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cc.spacing.section.md}>
      {/* Search, Filter and Add Button */}
      <div className={`flex flex-col lg:flex-row ${cc.spacing.gap.lg} items-start lg:items-center justify-between`}>
        <div className={`flex flex-col sm:flex-row ${cc.spacing.gap.md} flex-1 w-full lg:w-auto`}>
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Zoek permissies..."
              value={filters.getFilterValue('search') as string || ''}
              onChange={(e) => filters.setFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          <div className={`flex ${cc.spacing.gap.sm}`}>
            <button
              onClick={() => filters.setFilter('type', 'all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${cc.transition.colors} ${
                filters.getFilterValue('type') === 'all'
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              Alle
            </button>
            <button
              onClick={() => filters.setFilter('type', 'system')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${cc.transition.colors} ${
                filters.getFilterValue('type') === 'system'
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              Systeem
            </button>
            <button
              onClick={() => filters.setFilter('type', 'custom')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${cc.transition.colors} ${
                filters.getFilterValue('type') === 'custom'
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              Aangepast
            </button>
          </div>
        </div>
        
        <button
          onClick={handleAdd}
          className={cc.button.base({ color: 'primary', className: `${cc.spacing.gap.sm} whitespace-nowrap` })}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nieuwe Permissie
        </button>
      </div>

      {/* Permissions by Resource */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Geen permissies gevonden</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
            {filters.hasActiveFilters ? 'Probeer een andere zoekopdracht of filter' : 'Klik op "Nieuwe Permissie" om te beginnen'}
          </p>
        </div>
      ) : (
        <div className={cc.spacing.section.md}>
          {filteredGroups.map(group => (
            <div key={group.resource} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Resource Header */}
              <div className={`bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 ${cc.spacing.px.md} ${cc.spacing.py.sm}`}>
                <div className={`flex items-center ${cc.spacing.gap.md}`}>
                  <div className="bg-white/20 rounded-lg p-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white capitalize">{group.resource}</h3>
                    <p className="text-blue-100 dark:text-blue-200 text-sm">{group.permissions.length} permissie(s)</p>
                  </div>
                </div>
              </div>

              {/* Permissions Grid */}
              <div className={`${cc.spacing.container.md} bg-gray-50 dark:bg-gray-700/30`}>
                <div className={`${cc.grid.permissions()} ${cc.spacing.gap.lg}`}>
                  {group.permissions.map(permission => (
                    <div
                      key={permission.id}
                      className={`bg-white dark:bg-gray-800 rounded-lg ${cc.spacing.container.sm} border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 ${cc.hover.card} ${cc.transition.shadow} group`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className={`flex items-center ${cc.spacing.gap.sm} mb-1`}>
                            <code className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                              {permission.action}
                            </code>
                            {permission.is_system_permission && (
                              <span className={cc.badge({ color: 'red' })}>
                                Systeem
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {permission.description}
                          </p>
                        </div>
                      </div>

                      <div className={`flex ${cc.spacing.gap.sm} pt-3 border-t border-gray-200 dark:border-gray-700`}>
                        <button
                          onClick={() => handleEdit(permission)}
                          disabled={permission.is_system_permission}
                          className={`flex-1 inline-flex items-center justify-center ${cc.spacing.gap.xs} px-3 py-1.5 rounded-md text-xs font-medium ${cc.transition.colors} ${
                            permission.is_system_permission
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                              : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Bewerken
                        </button>
                        <button
                          onClick={() => handleDelete(permission.id)}
                          disabled={permission.is_system_permission}
                          className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md ${cc.transition.colors} ${
                            permission.is_system_permission
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                              : 'bg-white dark:bg-gray-700 border border-red-300 dark:border-red-600/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
                          }`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPermission ? 'Permissie Bijwerken' : 'Nieuwe Permissie'}
        size="lg"
      >
        <PermissionForm
          initialValues={selectedPermission ?? undefined}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  )
}