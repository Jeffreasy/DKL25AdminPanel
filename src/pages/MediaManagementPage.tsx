import { useState, useEffect } from 'react'
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom'
import { PhotosOverview } from '../features/photos/PhotosOverview'
import { AlbumsOverview } from '../features/albums/AlbumsOverview'
import { usePageTitle } from '../hooks/usePageTitle'
import { useNavigationHistory } from '../features/navigation'
import { usePermissions } from '../hooks/usePermissions'
import { H1, SmallText } from '../components/typography/typography'
import {
  PhotoIcon,
  FolderIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { cc } from '../styles/shared'

type MediaTab = 'photos' | 'albums'

export function MediaManagementPage() {
  usePageTitle('Media beheren')
  const { hasPermission } = usePermissions()
  const { addToHistory } = useNavigationHistory()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  
  // Determine initial tab based on legacy route or query param
  const getInitialTab = (): MediaTab => {
    if (location.pathname === '/photos') return 'photos'
    if (location.pathname === '/albums') return 'albums'
    return (searchParams.get('tab') as MediaTab) || 'photos'
  }
  
  const [activeTab, setActiveTab] = useState<MediaTab>(getInitialTab())
  const [showInfoBanner, setShowInfoBanner] = useState(() => {
    // Check localStorage to see if user has dismissed the info banner
    return localStorage.getItem('media-info-banner-dismissed') !== 'true'
  })

  const canReadPhotos = hasPermission('photo', 'read')
  const canReadAlbums = hasPermission('album', 'read')

  const handleDismissInfoBanner = () => {
    setShowInfoBanner(false)
    localStorage.setItem('media-info-banner-dismissed', 'true')
  }

  // Update URL when tab changes
  const handleTabChange = (tab: MediaTab) => {
    setActiveTab(tab)
    setSearchParams({ tab }, { replace: true })
  }

  useEffect(() => {
    addToHistory('Media')
  }, [addToHistory])

  // Redirect legacy routes to new route with tab parameter
  useEffect(() => {
    if (location.pathname === '/photos') {
      navigate('/media?tab=photos', { replace: true })
    } else if (location.pathname === '/albums') {
      navigate('/media?tab=albums', { replace: true })
    }
  }, [location.pathname, navigate])

  // Sync tab with URL params
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as MediaTab
    if (tabFromUrl && (tabFromUrl === 'photos' || tabFromUrl === 'albums')) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams])

  // Check permissions
  if (!canReadPhotos && !canReadAlbums) {
    return (
      <div className={cc.spacing.container.md}>
        <div className="text-center">
          <H1>Geen toegang</H1>
          <SmallText>U heeft geen toestemming om media te beheren.</SmallText>
        </div>
      </div>
    )
  }

  // If user can only read one type, redirect to that tab
  if (!canReadPhotos && canReadAlbums && activeTab === 'photos') {
    setActiveTab('albums')
  }
  if (!canReadAlbums && canReadPhotos && activeTab === 'albums') {
    setActiveTab('photos')
  }

  return (
    <div className={cc.spacing.section.md}>
      {/* Info Banner - Explaining Photo-Album Relationship */}
      {showInfoBanner && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                📸 Hoe werkt Media Management?
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <p>
                  <strong>Foto's:</strong> Individuele foto's die je uploadt. Je kunt foto's uploaden, bewerken, verwijderen en organiseren in albums.
                </p>
                <p>
                  <strong>Albums:</strong> Verzamelingen van foto's die je kunt groeperen per thema, evenement of datum. Elk album kan meerdere foto's bevatten en op de website worden getoond.
                </p>
                <div className="bg-blue-100/50 dark:bg-blue-800/30 rounded p-3 mt-3">
                  <p className="font-medium mb-1">💡 Workflow:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Upload foto's in de <strong>Foto's</strong> tab</li>
                    <li>Maak een nieuw album in de <strong>Albums</strong> tab</li>
                    <li>Voeg foto's toe aan je album</li>
                    <li>Publiceer het album op de website</li>
                  </ol>
                </div>
              </div>
            </div>
            <button
              onClick={handleDismissInfoBanner}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
              title="Sluit deze uitleg"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header with Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className={`${cc.spacing.px.sm} ${cc.spacing.py.lg} sm:px-6`}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <H1 className="mb-1">Media Beheer</H1>
              <SmallText>
                Beheer al je foto's en albums op één centrale plek
              </SmallText>
            </div>
            <button
              onClick={() => setShowInfoBanner(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Toon uitleg over foto's en albums"
            >
              <InformationCircleIcon className="w-5 h-5" />
              Hoe werkt het?
            </button>
          </div>

          {/* Tab Navigation with Descriptions */}
          <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex flex-col sm:flex-row sm:space-x-8" aria-label="Tabs">
              {canReadPhotos && (
                <button
                  onClick={() => handleTabChange('photos')}
                  className={`
                    group inline-flex items-start sm:items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === 'photos'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                    ${cc.transition.colors}
                  `}
                  title="Beheer individuele foto's - upload, bewerk en organiseer"
                >
                  <PhotoIcon className={`
                    -ml-0.5 mr-2 h-5 w-5 flex-shrink-0 mt-0.5 sm:mt-0
                    ${activeTab === 'photos'
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                    }
                  `} />
                  <div className="flex flex-col items-start">
                    <span>Foto's</span>
                    <span className={`text-xs font-normal mt-0.5 ${
                      activeTab === 'photos'
                        ? 'text-blue-500 dark:text-blue-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      Individuele foto's beheren
                    </span>
                  </div>
                </button>
              )}
              {canReadAlbums && (
                <button
                  onClick={() => handleTabChange('albums')}
                  className={`
                    group inline-flex items-start sm:items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === 'albums'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                    ${cc.transition.colors}
                  `}
                  title="Beheer albums - groepeer foto's per evenement of thema"
                >
                  <FolderIcon className={`
                    -ml-0.5 mr-2 h-5 w-5 flex-shrink-0 mt-0.5 sm:mt-0
                    ${activeTab === 'albums'
                      ? 'text-blue-500 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                    }
                  `} />
                  <div className="flex flex-col items-start">
                    <span>Albums</span>
                    <span className={`text-xs font-normal mt-0.5 ${
                      activeTab === 'albums'
                        ? 'text-blue-500 dark:text-blue-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      Foto collecties organiseren
                    </span>
                  </div>
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'photos' && canReadPhotos && <PhotosOverview />}
        {activeTab === 'albums' && canReadAlbums && <AlbumsOverview />}
      </div>
    </div>
  )
}