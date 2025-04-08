import { useState, useEffect } from 'react'
import { supabase } from '../../lib//supabase/supabaseClient'
import { TitleSection } from '../../types/titleSection'
import { TitleSectionForm } from './components/TitleSectionForm'

export function TitleSectionOverview() {
  const [titleSection, setTitleSection] = useState<TitleSection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchTitleSection()
  }, [])

  const fetchTitleSection = async () => {
    try {
      const { data, error } = await supabase
        .from('title_sections')
        .select('*')
        .single()

      if (error) throw error
      setTitleSection(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  )
  
  if (error) return (
    <div className="text-red-500 p-4 text-center bg-red-50 rounded-lg">
      {error}
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Titel Sectie Beheer
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Beheer de titel sectie van de DKL25 website
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 
              hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-indigo-500"
          >
            Bewerken
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {titleSection && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="space-y-4">
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
              <img 
                src={titleSection.image_url} 
                alt="Hero afbeelding"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {titleSection.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {titleSection.subtitle}
              </p>
              <div className="text-indigo-600 dark:text-indigo-400 font-medium">
                {titleSection.cta_text}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {titleSection.event_details.map((detail, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 p-4 bg-gray-50 
                    dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <span className="text-gray-400">{detail.icon}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {detail.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {detail.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && titleSection && (
        <TitleSectionForm
          titleSection={titleSection}
          onComplete={() => {
            setShowForm(false)
            fetchTitleSection()
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
} 