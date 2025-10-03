export interface ChatChannel {
  id: string
  name: string
  description?: string
  type: 'public' | 'private' | 'direct'
  created_by: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface ChatChannelParticipant {
  id: string
  channel_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
  last_seen_at?: string
  is_active: boolean
}

export interface ChatMessage {
  id: string
  channel_id: string
  user_id: string
  content?: string
  message_type: 'text' | 'image' | 'file' | 'system'
  file_url?: string
  file_name?: string
  file_size?: number
  reply_to_id?: string
  edited_at?: string
  created_at: string
  updated_at: string
  // Joined data
  user?: ChatUser
  reply_to?: ChatMessage
  reactions?: ChatMessageReaction[]
}

export interface ChatMessageReaction {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
  user?: ChatUser
}

export interface ChatUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  status?: 'online' | 'away' | 'busy' | 'offline'
  last_seen?: string
}

export interface ChatUserPresence {
  user_id: string
  status: 'online' | 'away' | 'busy' | 'offline'
  last_seen: string
  updated_at: string
}

export interface TypingIndicator {
  id: string
  channel_id: string
  user_id: string
  started_at: string
  user?: ChatUser
}

// API Request/Response types
export interface CreateChannelRequest {
  name: string
  description?: string
  type: 'public' | 'private'
}

export interface SendMessageRequest {
  channel_id: string
  content?: string
  message_type?: 'text' | 'image' | 'file' | 'system'
  file_url?: string
  file_name?: string
  file_size?: number
  reply_to_id?: string
}

export interface FileUploadResult {
  url: string
  public_id: string
  format: string
  bytes: number
}

export interface UpdateMessageRequest {
  content: string
}

export interface ChannelWithDetails extends ChatChannel {
  participants?: ChatChannelParticipant[]
  participant_count?: number
  unread_count?: number
  last_message?: ChatMessage
}

export interface MessageWithDetails extends ChatMessage {
  user: ChatUser
  reactions: ChatMessageReaction[]
  reply_to?: MessageWithDetails
}

// Real-time event types
export interface RealtimeMessageEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: 'chat_messages'
  record: ChatMessage
  old_record?: ChatMessage
}

export interface RealtimePresenceEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: 'chat_user_presence'
  record: ChatUserPresence
  old_record?: ChatUserPresence
}

export interface RealtimeParticipantEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: 'chat_channel_participants'
  record: ChatChannelParticipant
  old_record?: ChatChannelParticipant
}

// UI State types
export interface ChatState {
  channels: ChannelWithDetails[]
  activeChannelId: string | null
  messages: { [channelId: string]: MessageWithDetails[] }
  onlineUsers: ChatUser[]
  typingUsers: { [channelId: string]: TypingIndicator[] }
  loading: {
    channels: boolean
    messages: boolean
    sending: boolean
  }
  error: string | null
}

// Hook return types
export interface UseChatReturn {
  state: ChatState
  actions: {
    selectChannel: (channelId: string) => void
    sendMessage: (request: SendMessageRequest) => Promise<void>
    editMessage: (messageId: string, request: UpdateMessageRequest) => Promise<void>
    deleteMessage: (messageId: string) => Promise<void>
    createChannel: (request: CreateChannelRequest) => Promise<ChatChannel>
    joinChannel: (channelId: string) => Promise<void>
    leaveChannel: (channelId: string) => Promise<void>
    startTyping: (channelId: string) => void
    stopTyping: (channelId: string) => void
    addReaction: (messageId: string, emoji: string) => Promise<void>
    removeReaction: (messageId: string, emoji: string) => Promise<void>
  }
}

export interface UseMessagesReturn {
  messages: MessageWithDetails[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
}

export interface UseChannelsReturn {
  channels: ChannelWithDetails[]
  loading: boolean
  error: string | null
  createChannel: (request: CreateChannelRequest) => Promise<ChatChannel>
  joinChannel: (channelId: string) => Promise<void>
  leaveChannel: (channelId: string) => Promise<void>
}

// Search result types
export interface MessageSearchResult {
  id: string
  channel_id: string
  user_id: string
  content?: string
  message_type: string
  file_url?: string
  file_name?: string
  file_size?: number
  created_at: string
  user_email: string
  user_full_name?: string
  channel_name: string
  rank: number
}

export interface MessageHistoryResult {
  id: string
  channel_id: string
  user_id: string
  content?: string
  message_type: string
  file_url?: string
  file_name?: string
  file_size?: number
  reply_to_id?: string
  edited_at?: string
  created_at: string
  user_email: string
  user_full_name?: string
  user_avatar_url?: string
  reactions: ChatMessageReaction[]
}