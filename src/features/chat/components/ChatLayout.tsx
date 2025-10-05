import { useState } from 'react'
import { ChatSidebar } from './ChatSidebar'
import { ChatWindow } from './ChatWindow'
import { ChatProvider } from '../ChatContext'

interface ChatLayoutProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatLayout({ isOpen, onClose }: ChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (!isOpen) return null

return (
  <div className="fixed inset-0 z-50 flex">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    />

    {/* Chat Panel */}
    <ChatProvider>
      <div className="relative ml-auto w-full h-full bg-white dark:bg-gray-800 shadow-2xl flex md:max-w-4xl md:mx-auto md:rounded-lg md:my-4">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-full border-r border-gray-200 dark:border-gray-700 flex-shrink-0 md:w-80 md:border-r">
            <ChatSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Main Chat Window */}
        <div className="flex-1 flex flex-col order-2 md:order-none">
          <ChatWindow
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onClose={onClose}
          />
        </div>
      </div>
    </ChatProvider>
  </div>
)
}
