import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Table, Button, Modal, Group, Text, ActionIcon, ScrollArea } from '@mantine/core'
import { H1 } from '../components/typography'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { userService } from '../features/users/services/userService'
import { UserForm } from '../features/users/components/UserForm'
import { useAuth } from '../contexts/auth/useAuth'
import type { User } from '../features/users/types'

export function UserManagementPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const queryClient = useQueryClient()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers()
  })

  const createMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsModalOpen(false)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
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
      await updateMutation.mutate({ id: selectedUser.id, data: values })
    } else {
      await createMutation.mutate(values)
    }
  }

  if (isLoading) return <Text>Laden...</Text>

  return (
    <div className="p-6">
      <Group justify="space-between" mb="md">
        <H1>Gebruikersbeheer</H1>
        {isAdmin && <Button onClick={handleAdd}>Nieuwe Gebruiker</Button>}
      </Group>
      <ScrollArea>
        <Table>
        <thead>
          <tr>
            <th className="font-medium text-gray-900 dark:text-white">Naam</th>
            <th className="font-medium text-gray-900 dark:text-white">Email</th>
            <th className="font-medium text-gray-900 dark:text-white">Rol</th>
            <th className="font-medium text-gray-900 dark:text-white">Actief</th>
            <th className="font-medium text-gray-900 dark:text-white">Acties</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="text-gray-700 dark:text-gray-300">{user.naam}</td>
              <td className="text-gray-700 dark:text-gray-300">{user.email}</td>
              <td className="text-gray-700 dark:text-gray-300">{user.rol}</td>
              <td className="text-gray-700 dark:text-gray-300">{user.is_actief ? 'Ja' : 'Nee'}</td>
              <td>
                {isAdmin && (
                  <Group gap="xs">
                    <ActionIcon color="blue" onClick={() => handleEdit(user)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon color="red" onClick={() => handleDelete(user.id)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      </ScrollArea>
      <Modal opened={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedUser ? 'Gebruiker Bijwerken' : 'Nieuwe Gebruiker'}>
        <UserForm
          initialValues={selectedUser ?? undefined}
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  )
}
