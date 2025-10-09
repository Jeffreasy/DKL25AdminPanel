import { useState, useRef } from 'react'
import { useChat } from '../ChatContext'
import { Bars3Icon, XMarkIcon, PaperAirplaneIcon, PaperClipIcon, MagnifyingGlassIcon, UsersIcon } from '@heroicons/react/24/outline'
import { chatService, getUserId } from '../services/chatService'
import { MessageSearch } from './MessageSearch'
import { Modal, Menu } from '@mantine/core'
import { chat as chatStyles, cc } from '../../../styles/shared'
import { ConfirmDialog } from '../../../components/ui'

interface ChatWindowProps {
  onToggleSidebar: () => void
  onClose: () => void
}

export function ChatWindow({ onToggleSidebar, onClose }: ChatWindowProps) {
  const { channels, messages, activeChannelId, sendMessage, loading, typingUsers, startTyping, stopTyping, allUsers, participants, inviteUserToChannel, editMessage, deleteMessage } = useChat()
  const [messageInput, setMessageInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null)
  const [messageToEdit, setMessageToEdit] = useState<{ id: string; content: string } | null>(null)
  const [editContent, setEditContent] = useState('')
  const currentUserId = getUserId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

const activeChannel = channels.find(c => c.id === activeChannelId)
console.log('Debug ChatWindow', { activeChannelId, found: !!activeChannel, channelsIds: channels.map(c => c.id) });


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value)

    if (activeChannelId) {
      if (!isTyping) {
        setIsTyping(true)
        startTyping(activeChannelId)
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false)
        stopTyping(activeChannelId)
      }, 1000)
    }
  }

  const handleSendMessage = () => {
    if (messageInput.trim() && activeChannelId) {
      sendMessage(activeChannelId, messageInput.trim())
      setMessageInput('')

      // Stop typing when sending message
      if (isTyping) {
        setIsTyping(false)
        stopTyping(activeChannelId)
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
      }
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeChannelId) return

    try {
      setIsUploading(true)
      setUploadProgress(0)

      await chatService.sendFileMessage(activeChannelId, file)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('File upload failed:', error)
      // Could add error toast here
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className={`flex items-center justify-between ${cc.spacing.container.sm} border-b border-gray-200 dark:border-gray-700`}>
        <div className={`flex items-center ${cc.spacing.gap.md}`}>
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden ${cc.transition.colors}`}
            title="Toggle sidebar"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>

          {activeChannel ? (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {activeChannel.type === 'public' ? '#' : '🔒'} {activeChannel.name}
              </h3>
              {activeChannel.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activeChannel.description}
                </p>
              )}
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Selecteer een kanaal
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Kies een kanaal uit de zijbalk om te beginnen met chatten
              </p>
            </div>
          )}
        </div>

        <div className={`flex items-center ${cc.spacing.gap.sm}`}>
          {activeChannel && (
            <>
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${cc.transition.colors}`}
                title="Invite users"
              >
                <UsersIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${cc.transition.colors}`}
                title="Zoek berichten"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${cc.transition.colors}`}
            title="Sluiten"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto ${cc.spacing.container.sm} ${cc.spacing.section.sm}`}>
        {loading.messages ? (
          <div className={cc.spacing.section.md}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className="max-w-xs lg:max-w-md px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              💬
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {activeChannel ? 'Geen berichten nog' : 'Selecteer een kanaal'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {activeChannel
                ? 'Wees de eerste die een bericht stuurt!'
                : 'Kies een kanaal om te beginnen met chatten'
              }
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.user_id === currentUserId;
            const canEditDelete = isOwnMessage || channels.find(c => c.id === activeChannelId)?.created_by === currentUserId;

            return (
              <div key={message.id} className={`flex ${cc.spacing.gap.md} ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                {!isOwnMessage && (
                  <div className={chatStyles.avatar({ userType: 'other' })}>
                    {(message.user?.full_name || message.user?.email || '?')[0].toUpperCase()}
                  </div>
                )}

                <div className="flex-1 max-w-[75%] min-w-0">
                  <Menu shadow="xl" width={200} position="bottom" withArrow>
                    <Menu.Target>
                      <div
                        className={chatStyles.message({
                          type: isOwnMessage ? 'own' : 'other',
                          hasReaction: false
                        })}
                      >
                        {/* Message Header */}
                        <div className={`flex items-center ${cc.spacing.gap.sm} mb-2`}>
                          <span className="font-medium text-xs">
                            {message.user?.full_name || message.user?.email || 'Onbekend'}
                          </span>
                          <span className="text-xs opacity-70">
                            {new Date(message.created_at).toLocaleTimeString('nl-NL', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {message.edited_at && (
                              <span className="ml-2 text-xs opacity-60 italic">
                                (bewerkt)
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Message Content */}
                        <div className="break-words">
                          {message.content}
                        </div>

                        {/* File attachment */}
                        {message.file_url && (
                          <div className="mt-3">
                            {message.message_type === 'image' ? (
                              <div className="max-w-full">
                                <img
                                  src={message.file_url}
                                  alt={message.file_name || 'Afbeelding'}
                                  className={`rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 ${cc.transition.opacity}`}
                                  onClick={() => window.open(message.file_url, '_blank')}
                                  loading="lazy"
                                />
                                {message.content && message.content !== message.file_name && (
                                  <p className="text-sm opacity-75 mt-2 italic">
                                    {message.content}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 p-3 bg-black/10 dark:bg-white/10 rounded-lg max-w-full">
                                <div className="text-lg">📎</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {message.file_name || 'Bijlage'}
                                  </p>
                                  {message.file_size && (
                                    <p className="text-xs opacity-70">
                                      {chatService.formatFileSize(message.file_size)}
                                    </p>
                                  )}
                                </div>
                                <a
                                  href={message.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 ${cc.transition.colors}`}
                                >
                                  Download
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Reaction Buttons */}
                        <div className={`flex ${cc.spacing.gap.sm} mt-3`}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('React to message:', message.id);
                            }}
                            className={chatStyles.reaction({ active: false })}
                          >
                            ❤️ 👍 😂
                          </button>
                        </div>
                      </div>
                    </Menu.Target>

                    {canEditDelete && (
                      <Menu.Dropdown className={chatStyles.contextMenu()}>
                        <Menu.Item
                          className={chatStyles.contextMenuItem({ variant: 'default' })}
                          onClick={() => {
                            setMessageToEdit({ id: message.id, content: message.content || '' });
                            setEditContent(message.content || '');
                          }}
                        >
                          ✏️ Edit Message
                        </Menu.Item>
                        <Menu.Item
                          className={chatStyles.contextMenuItem({ variant: 'danger' })}
                          onClick={() => setMessageToDelete(message.id)}
                        >
                          🗑️ Delete Message
                        </Menu.Item>
                      </Menu.Dropdown>
                    )}
                  </Menu>
                </div>

                {isOwnMessage && (
                  <div className={chatStyles.avatar({ userType: 'own' })}>
                    {(message.user?.full_name || message.user?.email || '?')[0].toUpperCase()}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span>
                {typingUsers.length === 1
                  ? `${typingUsers[0].user?.full_name || typingUsers[0].user?.email || 'Iemand'} is aan het typen...`
                  : `${typingUsers.length} mensen zijn aan het typen...`
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      {activeChannel && (
        <div className={`${cc.spacing.container.sm} border-t border-gray-200 dark:border-gray-700`}>
          {/* Upload Progress */}
          {isUploading && (
            <div className="mb-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                    Bestand uploaden...
                  </p>
                  <div className="w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-2 mt-1">
                    <div
                      className={`bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full ${cc.transition.normal}`}
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={`flex ${cc.spacing.gap.md}`}>
            {/* File Upload Buttons */}
            <div className={`flex ${cc.spacing.gap.sm} flex-shrink-0`}>
              <button
                onClick={handleFileSelect}
                disabled={isUploading}
                className={`p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg ${cc.transition.colors}`}
                title="Bestand bijvoegen"
              >
                <PaperClipIcon className="w-5 h-5" />
              </button>
            </div>

            <textarea
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Bericht naar #${activeChannel.name}...`}
              className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 120) + 'px'
              }}
            />

            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || loading.sending || isUploading}
              className={`${cc.spacing.px.sm} ${cc.spacing.py.xs} bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${cc.spacing.gap.sm} flex-shrink-0 ${cc.transition.colors}`}
            >
              {loading.sending ? (
                <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <PaperAirplaneIcon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Verstuur</span>
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
          />
        </div>
      )}

      {/* Message Search Modal */}
      <MessageSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectMessage={(message) => {
          // Could scroll to message or switch channel
          console.log('Selected message:', message)
        }}
      />

      {/* Invite Modal */}
      <Modal
        opened={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Gebruikers uitnodigen"
        size="md"
        centered
      >
        <div className={`max-h-96 overflow-y-auto ${cc.spacing.section.xs}`}>
          {allUsers.filter(u => u.id !== currentUserId && !participants.some(p => p.user_id === u.id)).map(user => (
            <div key={user.id} className={chatStyles.inviteUserCard()}>
              <div className={chatStyles.inviteUserAvatar()}>
                {(user.full_name || user.email || '?')[0].toUpperCase()}
              </div>
              <div className={chatStyles.inviteUserInfo()}>
                <div className={chatStyles.inviteUserName()}>
                  {user.full_name || (user.email ? user.email.split('@')[0] : 'Anonieme gebruiker')}
                </div>
                <div className={chatStyles.inviteUserEmail()}>
                  {user.email}
                </div>
              </div>
              <button
                className={chatStyles.inviteButton({ variant: 'invite' })}
                onClick={() => inviteUserToChannel(user.id)}
              >
                Uitnodigen
              </button>
            </div>
          ))}
          {allUsers.filter(u => u.id !== currentUserId && !participants.some(p => p.user_id === u.id)).length === 0 && (
            <div className={chatStyles.emptyState()}>
              <div className={chatStyles.emptyStateIcon()}>
                👥
              </div>
              <div className={chatStyles.emptyStateTitle()}>
                Niemand om uit te nodigen
              </div>
              <div className={chatStyles.emptyStateDescription()}>
                Alle gebruikers zijn al lid van dit kanaal
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Message Confirmation */}
      <ConfirmDialog
        open={!!messageToDelete}
        onClose={() => setMessageToDelete(null)}
        onConfirm={() => {
          if (messageToDelete) {
            deleteMessage(messageToDelete);
            setMessageToDelete(null);
          }
        }}
        title="Bericht verwijderen"
        message="Weet je zeker dat je dit bericht wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt."
        variant="danger"
      />

      {/* Edit Message Dialog */}
      {messageToEdit && (
        <div className={`fixed inset-0 ${cc.overlay.medium} z-50 flex items-center justify-center ${cc.spacing.container.sm}`}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
            <div className={`${cc.spacing.px.md} ${cc.spacing.py.sm} border-b border-gray-200 dark:border-gray-700 flex justify-between items-center`}>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bericht bewerken</h3>
              <button
                onClick={() => {
                  setMessageToEdit(null);
                  setEditContent('');
                }}
                className={cc.button.icon({ color: 'secondary' })}
                title="Sluiten"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className={cc.spacing.container.md}>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className={cc.form.input({ className: 'w-full' })}
                rows={4}
                autoFocus
              />
            </div>
            <div className={`${cc.spacing.px.md} ${cc.spacing.py.sm} bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end ${cc.spacing.gap.md}`}>
              <button
                onClick={() => {
                  setMessageToEdit(null);
                  setEditContent('');
                }}
                className={cc.button.base({ color: 'secondary' })}
              >
                Annuleren
              </button>
              <button
                onClick={() => {
                  if (editContent.trim() && editContent.trim() !== messageToEdit.content) {
                    editMessage(messageToEdit.id, editContent.trim());
                  }
                  setMessageToEdit(null);
                  setEditContent('');
                }}
                disabled={!editContent.trim()}
                className={cc.button.base({ color: 'primary' })}
              >
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
