import { useEffect } from 'react'
import { PhotosOverview } from '../features/photos/PhotosOverview'
import { usePageTitle } from '../hooks/usePageTitle'
import { useNavigationHistory } from '../contexts/navigation/useNavigationHistory'
import { usePermissions } from '../hooks/usePermissions'
import { H1, SmallText } from '../components/typography'
import { cc } from '../styles/shared'

export function PhotoManagementPage() {
  usePageTitle("Foto's beheren")
  const { hasPermission } = usePermissions()
  const { addToHistory } = useNavigationHistory()

  const canReadPhotos = hasPermission('photo', 'read')

  useEffect(() => {
    addToHistory("Foto's")
  }, [addToHistory])

  if (!canReadPhotos) {
    return (
      <div className={cc.spacing.container.md}>
        <div className="text-center">
          <H1>Geen toegang</H1>
          <SmallText>U heeft geen toestemming om foto's te beheren.</SmallText>
        </div>
      </div>
    )
  }

  return <PhotosOverview />
}