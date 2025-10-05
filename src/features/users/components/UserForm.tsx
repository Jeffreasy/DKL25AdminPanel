import { useState } from 'react'
import { Button, TextInput, Switch, Select, Text } from '@mantine/core'
import type { User, CreateUserRequest, UpdateUserRequest } from '../types'

interface UserFormProps {
  initialValues?: User
  onSubmit: (values: CreateUserRequest | UpdateUserRequest) => Promise<void>
  isSubmitting: boolean
}

export function UserForm({ initialValues, onSubmit, isSubmitting }: UserFormProps) {
  const isEdit = !!initialValues
  const [email, setEmail] = useState(initialValues?.email || '')
  const [naam, setNaam] = useState(initialValues?.naam || '')
  const [rol, setRol] = useState(initialValues?.rol || 'Deelnemer')
  const [password, setPassword] = useState('')
  const [isActief, setIsActief] = useState(initialValues?.is_actief ?? true)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const validate = () => {
    const newErrors: {[key: string]: string} = {}
    if (!/^\S+@\S+$/.test(email)) newErrors.email = 'Ongeldig emailadres'
    if (!naam) newErrors.naam = 'Naam is vereist'
    if (!rol) newErrors.rol = 'Rol is vereist'
    if (!isEdit && password.length < 6) newErrors.password = 'Wachtwoord moet minstens 6 karakters zijn'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    const values = { email, naam, rol, password, is_actief: isActief }
    await onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <TextInput
          label="Email"
          placeholder="email@voorbeeld.nl"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          error={errors.email}
        />
      </div>
      <div>
        <TextInput
          label="Naam"
          placeholder="Volledige naam"
          value={naam}
          onChange={(e) => setNaam(e.currentTarget.value)}
          error={errors.naam}
        />
      </div>
      <div>
        <Select
          label="Rol"
          data={['admin', 'staff', 'Deelnemer', 'Begeleider', 'Vrijwilliger']}
          value={rol}
          onChange={(value) => setRol(value || 'Deelnemer')}
          error={errors.rol}
        />
      </div>
      <div>
        <TextInput
          type="password"
          label="Wachtwoord"
          placeholder={isEdit ? 'Laat leeg om niet te wijzigen' : 'Minstens 6 karakters'}
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          error={errors.password}
        />
      </div>
      <div>
        <Switch
          label="Actief"
          checked={isActief}
          onChange={(e) => setIsActief(e.currentTarget.checked)}
        />
      </div>
      <Button type="submit" loading={isSubmitting}>
        {isEdit ? 'Bijwerken' : 'Aanmaken'}
      </Button>
    </form>
  )
}
