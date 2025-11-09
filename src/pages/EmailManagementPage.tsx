import React, { useState } from 'react'
import EmailInbox from '../features/email/components/EmailInbox'
import AutoResponseManager from '../features/email/components/AutoResponseManager'
import { usePageTitle } from '../hooks/usePageTitle'
import { cc } from '../styles/shared'
import { InboxIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

type TabType = 'inbox' | 'autoresponse'

export default function EmailManagementPage() {
  usePageTitle('Email Management')
  const [activeTab, setActiveTab] = useState<TabType>('inbox')

  const tabs = [
    { id: 'inbox' as TabType, label: 'Inbox', icon: InboxIcon },
    { id: 'autoresponse' as TabType, label: 'AutoResponse Templates', icon: DocumentTextIcon }
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4 px-6 pt-4" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 ${cc.transition.colors}
                  ${isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <Icon className={`h-5 w-5 mr-2 ${isActive ? 'text-blue-500 dark:text-blue-400' : ''}`} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'inbox' && <EmailInbox />}
        {activeTab === 'autoresponse' && (
          <div className={cc.spacing.container.md}>
            <AutoResponseManager />
          </div>
        )}
      </div>
    </div>
  )
}