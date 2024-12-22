import { useTheme } from '../../hooks/useTheme'

export function NavigationSkeleton() {
  const { isDarkMode } = useTheme()

  return (
    <div className="animate-pulse px-2 py-4">
      {/* Main navigation items */}
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`flex items-center px-2 py-2 rounded-md ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}
          >
            <div className={`h-6 w-6 rounded-md ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`} />
            <div
              className={`ml-3 h-4 w-24 rounded ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Favorites section */}
      <div className="mt-8">
        <div className={`h-3 w-16 rounded ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`} />
        <div className="mt-3 space-y-2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className={`flex items-center px-2 py-2 rounded-md ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}
            >
              <div className={`h-5 w-5 rounded ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`} />
              <div
                className={`ml-3 h-4 w-20 rounded ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Recent pages section */}
      <div className="mt-8">
        <div className={`h-3 w-24 rounded ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
        }`} />
        <div className="mt-3 space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`flex items-center px-2 py-2 rounded-md ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}
            >
              <div className={`h-5 w-5 rounded ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`} />
              <div
                className={`ml-3 h-4 w-28 rounded ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* User navigation */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className={`flex items-center px-2 py-2 rounded-md ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}
            >
              <div className={`h-6 w-6 rounded-md ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
              }`} />
              <div
                className={`ml-3 h-4 w-16 rounded ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 