import React from 'react'
import { NotulenDetail } from '@/features/notulen'
import { usePageTitle } from '@/hooks'

export function NotulenDetailPage() {
  usePageTitle('Notulen Details')

  return <NotulenDetail />
}
