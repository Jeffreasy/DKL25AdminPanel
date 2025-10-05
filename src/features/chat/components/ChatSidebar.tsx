import { useState } from 'react'
import { useChat } from '../ChatContext'
import { PlusIcon, HashtagIcon, LockClosedIcon, UsersIcon } from '@heroicons/react/24/outline'

interface ChatSidebarProps {
  onClose: () => void
}

export function ChatSidebar({ onClose }: ChatSidebarProps) {
  const { channels, onlineUsers, activeChannelId, selectChannel, createChannel, loading } = useChat()
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [error, setError] = useState('')

  const handleCreateChannel = async () => {
    const channelName = newChannelName.trim()

    if (!channelName) {
      setError('Kanaal naam is verplicht')
      return
    }

    if (channelName.length < 2) {
      setError('Kanaal naam moet minstens 2 karakters bevatten')
      return
    }

    if (channelName.length > 50) {
      setError('Kanaal naam mag maximaal 50 karakters bevatten')
      return
    }

    // Check if channel name already exists
if (channels.some(c => c.name?.toLowerCase() === channelName.toLowerCase())) {
  setError('Een kanaal met deze naam bestaat al')
  return
}

    try {
      setError('')
      await createChannel(channelName)
      setNewChannelName('')
      setShowCreateChannel(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is iets misgegaan bij het aanmaken van het kanaal')
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Team Chat
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Create Channel */}
          <div>
            <button
              onClick={() => setShowCreateChannel(!showCreateChannel)}
              className="w-full flex items-center gap-2 p-2 text-left text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            >
              <PlusIcon className="w-4 h-4" />
              Kanaal toevoegen
            </button>

            {showCreateChannel && (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="Kanaal naam..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateChannel()}
                />
                {error && (
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateChannel}
                    disabled={loading.channels}
                    className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading.channels ? 'Aanmaken...' : 'Aanmaken'}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateChannel(false)
                      setError('')
                      setNewChannelName('')
                    }}
                    className="px-3 py-1 text-xs bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Channel List */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Kanalen
            </h3>
            <div className="space-y-1">
              {loading.channels ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
channels.filter(channel => channel.id && channel.name).map((channel) => (
<button
  key={channel.id}
  onClick={() => {
    selectChannel(channel.id)
    if (window.innerWidth < 768) onClose()
  }}
  className={`w-full flex items-center gap-2 p-2 text-left text-sm rounded-md transition-colors ${
    activeChannelId === channel.id
      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-100'
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
  }`}
>
    {channel.type === 'public' ? (
      <HashtagIcon className="w-4 h-4 flex-shrink-0" />
    ) : (
      <LockClosedIcon className="w-4 h-4 flex-shrink-0" />
    )}
    <span className="truncate">{channel.name}</span>
    {channel.unread_count && channel.unread_count > 0 && (
      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
        {channel.unread_count}
      </span>
    )}
  </button>
))
              )}
            </div>
          </div>

          {/* Online Users */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
              <UsersIcon className="w-3 h-3" />
              Online ({onlineUsers.length})
            </h3>
            <div className="space-y-1">
              {onlineUsers.slice(0, 10).map((user) => (
                <div key={user.id} className="flex items-center gap-2 p-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  <span className="truncate">{user.full_name || user.email}</span>
                </div>
              ))}
              {onlineUsers.length > 10 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                  +{onlineUsers.length - 10} meer online
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
