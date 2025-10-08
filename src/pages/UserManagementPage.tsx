import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@mantine/core'
import { userService } from '../features/users/services/userService'
import { UserForm } from '../features/users/components/UserForm'
import { usePermissions } from '../hooks/usePermissions'
import { useAuth } from '../contexts/auth/useAuth'
import { H1, SmallText } from '../components/typography'
import { cc } from '../styles/shared'
import type { User } from '../features/users/types'

export function UserManagementPage() {
  const { hasPermission } = usePermissions()
  const { isLoading: authLoading } = useAuth()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  const canReadUsers = hasPermission('user', 'read')
  const canWriteUsers = hasPermission('user', 'write')
  const canDeleteUsers = hasPermission('user', 'delete')

  const queryClient = useQueryClient()

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers(),
    enabled: !authLoading && canReadUsers,
    retry: 1
  })

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.naam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.rol === filterRole;
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && user.is_actief) ||
      (filterStatus === 'inactive' && !user.is_actief);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get unique roles
  const roles = [...new Set(users.map(u => u.rol))].sort();

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_actief).length,
    inactive: users.filter(u => !u.is_actief).length,
    newsletter: users.filter(u => u.newsletter_subscribed).length,
  };

  const createMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsModalOpen(false)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => userService.updateUser(id, data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['users'], (oldData: User[] = []) => {
        return oldData.map(user => user.id === updatedUser.id ? updatedUser : user)
      })
      setIsModalOpen(false)
      setSelectedUser(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] })
  })

  const handleAdd = () => {
    setSelectedUser(null)
    setIsModalOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Weet je zeker dat je deze gebruiker wilt verwijderen?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleSubmit = async (values: any) => {
    if (selectedUser) {
      const updateData = {
        email: values.email,
        naam: values.naam,
        rol: values.rol,
        is_actief: values.is_actief,
        newsletter_subscribed: values.newsletter_subscribed,
        ...(values.password && values.password.trim() !== '' && { password: values.password })
      }
      await updateMutation.mutateAsync({ id: selectedUser.id, data: updateData })
    } else {
      await createMutation.mutateAsync(values)
    }
  }

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

  if (!canReadUsers) {
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
            Je hebt geen toestemming om gebruikers te beheren.
          </p>
        </div>
      </div>
    )
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
        <p className="text-red-900 dark:text-red-300 font-semibold">Fout bij laden gebruikers</p>
        <p className="text-red-700 dark:text-red-400 text-sm mt-2">{error.message}</p>
      </div>
    )
  }

  return (
    <div className={cc.spacing.section.md}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className={`${cc.spacing.px.sm} ${cc.spacing.py.lg} sm:px-6`}>
          <H1 className="mb-1">Gebruikersbeheer</H1>
          <SmallText>
            Beheer gebruikersaccounts en hun toegangsrechten
          </SmallText>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className={`${cc.grid.statsFour()} ${cc.spacing.gap.xl}`}>
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${cc.spacing.container.md} border border-gray-200 dark:border-gray-700 ${cc.hover.card} ${cc.transition.shadow}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Totaal Gebruikers</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-3">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${cc.spacing.container.md} border border-gray-200 dark:border-gray-700 ${cc.hover.card} ${cc.transition.shadow}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Actief</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/50 rounded-lg p-3">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${cc.spacing.container.md} border border-gray-200 dark:border-gray-700 ${cc.hover.card} ${cc.transition.shadow}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Inactief</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.inactive}</p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <svg className="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm ${cc.spacing.container.md} border border-gray-200 dark:border-gray-700 ${cc.hover.card} ${cc.transition.shadow}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Nieuwsbrief</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.newsletter}</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-3">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className={`${cc.spacing.container.md} ${cc.spacing.section.md}`}>
          {/* Search, Filter and Add Button */}
          <div className={`flex flex-col lg:flex-row ${cc.spacing.gap.lg} items-start lg:items-center justify-between`}>
            <div className={`flex flex-col sm:flex-row ${cc.spacing.gap.md} flex-1 w-full lg:w-auto`}>
              <div className="relative flex-1 max-w-md">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Zoek gebruikers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              
              <div className={`flex ${cc.spacing.gap.sm}`}>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className={cc.form.select({ className: 'text-sm' })}
                >
                  <option value="all">Alle Rollen</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className={cc.form.select({ className: 'text-sm' })}
                >
                  <option value="all">Alle Status</option>
                  <option value="active">Actief</option>
                  <option value="inactive">Inactief</option>
                </select>
              </div>
            </div>
            
            {canWriteUsers && (
              <button
                onClick={handleAdd}
                className={cc.button.base({ color: 'primary', className: `${cc.spacing.gap.sm} whitespace-nowrap` })}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nieuwe Gebruiker
              </button>
            )}
          </div>

          {/* Users Grid */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <svg className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Geen gebruikers gevonden</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                {searchQuery || filterRole !== 'all' || filterStatus !== 'all' 
                  ? 'Probeer een andere zoekopdracht of filter' 
                  : 'Klik op "Nieuwe Gebruiker" om te beginnen'}
              </p>
            </div>
          ) : (
            <div className={`${cc.grid.userCards()} ${cc.spacing.gap.xl}`}>
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${cc.hover.card} ${cc.transition.shadow} overflow-hidden`}
                >
                  {/* Card Header */}
                  <div className={`bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 ${cc.spacing.container.sm}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white mb-1">{user.naam}</h3>
                        <p className="text-blue-100 dark:text-blue-200 text-sm truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="bg-white/20 rounded-lg p-2 flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className={`${cc.spacing.container.sm} ${cc.spacing.section.xs}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Rol:</span>
                      <span className={cc.badge({ color: 'blue' })}>
                        {user.rol}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                      <span className={cc.badge({ color: user.is_actief ? 'green' : 'gray' })}>
                        {user.is_actief ? 'Actief' : 'Inactief'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Nieuwsbrief:</span>
                      <span className={cc.badge({ color: user.newsletter_subscribed ? 'blue' : 'gray' })}>
                        {user.newsletter_subscribed ? 'Ja' : 'Nee'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className={`flex items-center ${cc.spacing.gap.sm} text-xs text-gray-500 dark:text-gray-400`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Aangemaakt: {new Date(user.created_at).toLocaleDateString('nl-NL')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className={`${cc.spacing.px.sm} ${cc.spacing.py.md} bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex ${cc.spacing.gap.sm}`}>
                    {canWriteUsers && (
                      <button
                        onClick={() => handleEdit(user)}
                        className={cc.button.base({ color: 'secondary', className: `flex-1 ${cc.spacing.gap.sm}` })}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Bewerken
                      </button>
                    )}
                    {canDeleteUsers && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className={cc.button.icon({ color: 'danger' })}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedUser ? 'Gebruiker Bijwerken' : 'Nieuwe Gebruiker'}
        size="lg"
      >
        <UserForm
          initialValues={selectedUser ?? undefined}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  )
}
