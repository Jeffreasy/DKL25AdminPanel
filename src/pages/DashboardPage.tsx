import { useState, useEffect, useCallback } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { fetchAanmeldingen } from '../features/aanmeldingen/services/aanmeldingenService'
import { fetchMessages, getContactStats } from '../features/contact/services/messageService'
import type { Aanmelding } from '../features/aanmeldingen/types'
import type { ContactMessage, ContactStats } from '../features/contact/types'
import { usePermissions } from '../hooks/usePermissions'
import { cc } from '../styles/shared'

interface DashboardStats {
  totaal: number
  rollen: Record<string, number>
  afstanden: Record<string, number>
  ondersteuning: Record<string, number>
}

const tabs = [
  { id: 'overzicht', label: 'Volledig overzicht', path: '' },
  { id: 'aanmeldingen', label: 'Aanmeldingen', path: 'aanmeldingen' },
  { id: 'contact', label: 'Contact', path: 'contact' },
  { id: 'inbox', label: 'Email Inbox', path: 'inbox' },
  { id: 'users', label: 'Gebruikers', path: 'users' }
]

export function DashboardPage() {
  const { hasPermission } = usePermissions()
  const [stats, setStats] = useState<DashboardStats>({
    totaal: 0,
    rollen: {},
    afstanden: {},
    ondersteuning: {}
  })
  
  const [contactStats, setContactStats] = useState<ContactStats>({
    counts: { 
      total: 0, 
      new: 0,
      inProgress: 0,
      handled: 0 
    },
    avgResponseTime: 0,
    messagesByPeriod: {
      daily: 0,
      weekly: 0,
      monthly: 0
    }
  })

  const [aanmeldingen, setAanmeldingen] = useState<Aanmelding[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])

  // Filter tabs based on permissions
  const filteredTabs = tabs.filter(tab => {
    if (tab.id === 'users') {
      return hasPermission('user', 'read')
    }
    // Other tabs are accessible to all authenticated users
    return true
  })

  const loadStats = useCallback(async () => {
    try {
      // For now, use legacy API until backend is fully migrated
      const { data, error } = await fetchAanmeldingen(100, 0)
      if (error) throw error

      const newStats: DashboardStats = {
        totaal: data.length,
        rollen: {
          deelnemer: data.filter(i => i.rol === 'deelnemer').length,
          begeleider: data.filter(i => i.rol === 'begeleider').length,
          vrijwilliger: data.filter(i => i.rol === 'vrijwilliger').length
        },
        afstanden: {
          '5km': data.filter(i => i.afstand === '5km').length,
          '10km': data.filter(i => i.afstand === '10km').length,
          '15km': data.filter(i => i.afstand === '15km').length
        },
        ondersteuning: {
          Ja: data.filter(i => i.ondersteuning === 'Ja').length,
          Nee: data.filter(i => i.ondersteuning === 'Nee').length,
          Anders: data.filter(i => i.ondersteuning === 'Anders').length
        }
      }

      setStats(newStats)
      setAanmeldingen(data)
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }, [])

  const loadMessages = useCallback(async () => {
    try {
      const [messagesResult, statsResult] = await Promise.all([
        fetchMessages(),
        getContactStats()
      ])
      
      if (messagesResult.error) throw messagesResult.error
      if (statsResult.error) throw statsResult.error
      
      setMessages(messagesResult.data)
      if (statsResult.data) {
        setContactStats(statsResult.data)
      }
    } catch (err) {
      console.error('Error loading messages:', err)
    }
  }, [])

  useEffect(() => {
    loadStats()
    loadMessages()
  }, [loadStats, loadMessages])

  const handleUpdate = useCallback(() => {
    loadStats()
    loadMessages()
  }, [loadStats, loadMessages])

  return (
    <div className={cc.spacing.section.md}>
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {filteredTabs.map(tab => (
              <NavLink
                key={tab.id}
                to={tab.path}
                className={({ isActive }) =>
                  `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${cc.transition.colors} ${
                    isActive
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                  }`
                }
                end={tab.path === ''}
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <Outlet
        context={{
          stats,
          contactStats,
          aanmeldingen,
          messages,
          handleUpdate,
        }}
      />
    </div>
  )
}
