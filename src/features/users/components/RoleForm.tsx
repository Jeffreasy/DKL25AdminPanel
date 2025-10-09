import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { permissionService } from '../services/permissionService'
import type { Role, CreateRoleRequest, PermissionWithId } from '../types'
import { cc } from '../../../styles/shared'

interface RoleFormProps {
  initialValues?: Role
  onSubmit: (values: CreateRoleRequest) => Promise<void>
  onPermissionUpdate?: (roleId: string, permissionIds: string[]) => Promise<void>
  isSubmitting: boolean
}

export function RoleForm({ initialValues, onSubmit, onPermissionUpdate, isSubmitting }: RoleFormProps) {
  const isEdit = !!initialValues
  const [name, setName] = useState(initialValues?.name || '')
  const [description, setDescription] = useState(initialValues?.description || '')
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    initialValues?.permissions?.map(p => p.id) || []
  )
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResource, setSelectedResource] = useState<string>('all')

  const isPermissionOnlyEdit = isEdit && !!initialValues?.id

  const { data: permissions = { groups: [], total: 0 }, isLoading: permissionsLoading, error: permissionsError } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionService.getPermissions()
  })

  useEffect(() => {
    if (initialValues) {
      try {
        setName(initialValues.name || '')
        setDescription(initialValues.description || '')
        const permissionIds = initialValues.permissions?.map((p: PermissionWithId | string) => {
          return typeof p === 'string' ? p : p?.id
        }).filter(Boolean) || []
        setSelectedPermissionIds(permissionIds)
        setErrors({})
      } catch (error) {
        console.error('Error setting initial values:', error)
        setName('')
        setDescription('')
        setSelectedPermissionIds([])
        setErrors({})
      }
    }
  }, [initialValues])

  const resources = React.useMemo(() => {
    return permissions.groups.map(g => g.resource).sort()
  }, [permissions.groups])

  const filteredGroups = React.useMemo(() => {
    return permissions.groups
      .filter(group => selectedResource === 'all' || group.resource === selectedResource)
      .map(group => ({
        ...group,
        permissions: group.permissions.filter(p =>
          p.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }))
      .filter(group => group.permissions.length > 0)
  }, [permissions.groups, searchQuery, selectedResource])


  const validate = () => {
    const newErrors: {[key: string]: string} = {}
    if (!name.trim()) newErrors.name = 'Naam is vereist'
    if (name && !/^[a-z_]+$/.test(name)) {
      newErrors.name = 'Rol naam mag alleen kleine letters en underscores bevatten'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isPermissionOnlyEdit) {
      if (initialValues?.id && onPermissionUpdate) {
        try {
          await onPermissionUpdate(initialValues.id, selectedPermissionIds)
        } catch (error) {
          console.error('Failed to update role permissions:', error)
          throw error
        }
      }
    } else {
      if (!validate()) return
      const values: CreateRoleRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        permission_ids: selectedPermissionIds
      }
      await onSubmit(values)
    }
  }

  const togglePermission = (permissionId: string) => {
    setSelectedPermissionIds(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    )
  }

  const selectAllInResource = (resource: string) => {
    const group = permissions.groups.find(g => g.resource === resource)
    if (!group) return

    const allSelected = group.permissions.every(p => selectedPermissionIds.includes(p.id))

    if (allSelected) {
      setSelectedPermissionIds(prev => prev.filter(id => !group.permissions.some(p => p.id === id)))
    } else {
      const newIds = group.permissions.map(p => p.id).filter(id => !selectedPermissionIds.includes(id))
      setSelectedPermissionIds(prev => [...prev, ...newIds])
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cc.spacing.section.md}>
      {/* Name Field */}
      <div>
        <label className={cc.form.label()}>
          Naam *
        </label>
        <input
          type="text"
          placeholder="bijv. admin, staff, editor"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPermissionOnlyEdit}
          className={`${cc.form.input()} ${
            errors.name ? 'border-red-500 dark:border-red-500' : ''
          } ${isPermissionOnlyEdit ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60' : ''}`}
        />
        {errors.name && (
          <p className={cc.form.error()}>
            {errors.name}
          </p>
        )}
        {isPermissionOnlyEdit && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Rol naam kan niet worden gewijzigd. Alleen permissies kunnen worden aangepast.
          </p>
        )}
      </div>

      {/* Description Field */}
      <div>
        <label className={cc.form.label()}>
          Beschrijving
        </label>
        <textarea
          placeholder="Optionele beschrijving van deze rol"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          disabled={isPermissionOnlyEdit}
          className={`${cc.form.input()} resize-none ${
            isPermissionOnlyEdit ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60' : ''
          }`}
        />
        {isPermissionOnlyEdit && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Rol beschrijving kan niet worden gewijzigd.
          </p>
        )}
      </div>

      {/* Permissions Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Permissies</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Selecteer welke permissies gebruikers met deze rol krijgen
            </p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/50 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {selectedPermissionIds.length} geselecteerd
            </span>
          </div>
        </div>

        {permissionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        ) : permissionsError ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600/50 rounded-lg p-4">
            <p className="text-sm text-red-700 dark:text-red-400">Fout bij laden permissies: {permissionsError.message}</p>
          </div>
        ) : permissions.total > 0 ? (
          <>
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Zoek permissies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${cc.form.input()} pl-9 text-sm`}
                />
              </div>
              <select
                value={selectedResource}
                onChange={(e) => setSelectedResource(e.target.value)}
                className={`${cc.form.select()} text-sm`}
              >
                <option value="all">Alle Resources</option>
                {resources.map(resource => (
                  <option key={resource} value={resource}>{resource}</option>
                ))}
              </select>
            </div>

            {/* Permissions List */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto bg-white dark:bg-gray-800">
              {filteredGroups.map(group => {
                const allSelected = group.permissions.every(p => selectedPermissionIds.includes(p.id))
                const someSelected = group.permissions.some(p => selectedPermissionIds.includes(p.id))

                return (
                  <div key={group.resource} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    {/* Resource Header */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 flex items-center justify-between sticky top-0">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={input => {
                            if (input) input.indeterminate = someSelected && !allSelected
                          }}
                          onChange={() => selectAllInResource(group.resource)}
                          className="w-4 h-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
                        />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{group.resource}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ({group.permissions.filter(p => selectedPermissionIds.includes(p.id)).length}/{group.permissions.length})
                        </span>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {group.permissions.map(permission => {
                        const isChecked = selectedPermissionIds.includes(permission.id);
                        return (
                          <label
                            key={permission.id}
                            className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(permission.id)}
                              className="mt-0.5 w-4 h-4 text-blue-600 dark:text-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <div className={`flex items-center ${cc.spacing.gap.sm}`}>
                                <code className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                                  {permission.action}
                                </code>
                                {permission.is_system_permission && (
                                  <span className={cc.badge({ color: 'red' })}>
                                    Systeem
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{permission.description}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Geen permissies beschikbaar</p>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className={`flex ${cc.spacing.gap.md} pt-4 border-t border-gray-200 dark:border-gray-700`}>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cc.button.base({ color: 'primary', className: `flex-1 ${cc.spacing.gap.sm}` })}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Bezig...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isPermissionOnlyEdit ? 'Permissies Bijwerken' : isEdit ? 'Bijwerken' : 'Aanmaken'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}