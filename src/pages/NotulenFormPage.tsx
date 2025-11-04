import React from 'react'
import { useParams } from 'react-router-dom'
import { NotulenForm } from '@/features/notulen'
import { usePageTitle } from '@/hooks'

export function NotulenFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

  usePageTitle(isEditing ? 'Notulen Bewerken' : 'Nieuwe Notulen')

  return <NotulenForm notulen={undefined} />
}
