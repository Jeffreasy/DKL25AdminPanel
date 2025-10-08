import { useState } from 'react'
import { usePermissions } from '../hooks/usePermissions'
import { PermissionList } from '../features/users/components/PermissionList'
import { RoleList } from '../features/users/components/RoleList'
import { useQuery } from '@tanstack/react-query'
import { roleService } from '../features/users/services/roleService'
import { permissionService } from '../features/users/services/permissionService'
import { H1, SmallText } from '../components/typography'
import { cc } from '../styles/shared'
import { useAuth } from '../contexts/auth/useAuth'

export function AdminPermissionsPage() {
  const { hasPermission } = usePermissions()
  const { isLoading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'permissions' | 'roles'>('roles')

  const canManagePermissions = hasPermission('admin', 'access') || hasPermission('user', 'manage_roles')

  // Fetch statistics - only enable when auth is loaded AND user has permission
  const { data: roles = [], isLoading: rolesLoading, error: rolesError } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.getRoles(),
    enabled: !authLoading && canManagePermissions,
    retry: 1
  })

  const { data: permissions = [], isLoading: permissionsLoading, error: permissionsError } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => permissionService.getPermissions(),
    enabled: !authLoading && canManagePermissions,
    retry: 1
  })

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Laden...</p>
        </div>
      </div>
    )
  }

  if (!canManagePermissions) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md w-full text-center border border-gray-200 dark:border-gray-700">
          <div className="bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Geen Toegang</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Je hebt geen toestemming om permissies en rollen te beheren.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cc.spacing.section.md}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className={`${cc.spacing.px.sm} ${cc.spacing.py.lg} sm:px-6`}>
          <H1 className="mb-1">Admin - Permissies & Rollen</H1>
          <SmallText>
            Beheer gebruikersrollen en hun permissies voor toegangscontrole
          </SmallText>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className={`${cc.grid.statsThree()} ${cc.spacing.gap.xl}`}>
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${cc.spacing.container.md} border border-gray-200 dark:border-gray-700 ${cc.hover.card} ${cc.transition.shadow}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Totaal Rollen</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{roles.length}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-3">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${cc.spacing.container.md} border border-gray-200 dark:border-gray-700 ${cc.hover.card} ${cc.transition.shadow}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Totaal Permissies</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{permissions.length}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-3">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${cc.spacing.container.md} border border-gray-200 dark:border-gray-700 ${cc.hover.card} ${cc.transition.shadow}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Systeem Permissies</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {permissions.filter(p => p.is_system_permission).length}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-3">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-t-lg">
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex-1 ${cc.spacing.px.sm} ${cc.spacing.py.md} text-sm font-medium rounded-md ${cc.transition.colors} ${
              activeTab === 'roles'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className={`flex items-center justify-center ${cc.spacing.gap.sm}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Rollen ({roles.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`flex-1 ${cc.spacing.px.sm} ${cc.spacing.py.md} text-sm font-medium rounded-md ${cc.transition.colors} ${
              activeTab === 'permissions'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <div className={`flex items-center justify-center ${cc.spacing.gap.sm}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Permissies ({permissions.length})
            </div>
          </button>
        </div>

        <div className={cc.spacing.container.md}>
          {activeTab === 'roles' ? <RoleList /> : <PermissionList />}
        </div>
      </div>
    </div>
  )
}