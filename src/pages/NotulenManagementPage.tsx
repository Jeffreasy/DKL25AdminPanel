import React from 'react'
import { NotulenList } from '@/features/notulen'
import { usePageTitle } from '@/hooks'

export function NotulenManagementPage() {
  usePageTitle('Notulen Beheer')

  return (
    <div className="container mx-auto px-4 py-8">
      <NotulenList />
    </div>
  )
}