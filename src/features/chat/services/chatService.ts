import { authManager } from '../../../api/client/auth'
import { jwtDecode } from 'jwt-decode'
import { uploadToCloudinary } from '../../../api/client/cloudinary'
import type {
  ChatChannel,
  ChatMessage,
  ChatUserPresence,
  CreateChannelRequest,
  SendMessageRequest,
  UpdateMessageRequest,
  ChannelWithDetails,
  MessageWithDetails,
  ChatUser,
  FileUploadResult,
  TypingIndicator,
  MessageSearchResult,
  MessageHistoryResult,
  ChatChannelParticipant
} from '../types'

// Base API URL from environment or default
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.dekoninklijkeloop.nl'

export const getUserId = () => {
  const token = authManager.getToken()
  if (!token) throw new Error('User not authenticated')
  const decoded: { sub: string } = jwtDecode(token)
  return decoded.sub // Assuming 'sub' is the user ID; adjust if different
}

// WebSocket connection
let ws: WebSocket | null = null
export const connectWebSocket = (token: string, channelId: string) => {
  // Include channel_id in URL path as backend expects /ws/:channel_id
  const newWs = new WebSocket(`${API_BASE.replace('http', 'ws')}/api/chat/ws/${channelId}?token=${token}`);
  ws = newWs;

  newWs.onopen = () => {
    console.log('WS connected - you should now be online', channelId);
    // Connection itself implies join for the channel in URL path
  };

  newWs.onclose = (event) => {
    console.log('WS disconnected - status set to offline', event.code, event.reason);
  };

  newWs.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('WS message received:', data);

      // Handle different message types at the global level
      if (data.type === 'connected') {
        console.log('WebSocket: successfully joined channel', channelId);
      }
    } catch (e) {
      console.error('Failed to parse WS message:', event.data);
    }
  };

  return newWs;
}


// Chat service using backend endpoints
export const chatService = {
  // Channels
  async getChannels(): Promise<ChannelWithDetails[]> {
    const data = await authManager.makeAuthenticatedRequest('/api/chat/channels') as ChatChannel[]
    // Note: Backend may not provide details like participants/last_message; enhance if needed
    return data.map(channel => ({ ...channel, participants: [], participant_count: 0, last_message: undefined }))
  },

  async createChannel(request: CreateChannelRequest): Promise<ChatChannel> {
    return await authManager.makeAuthenticatedRequest('/api/chat/channels', {
      method: 'POST',
      body: JSON.stringify(request)
    }) as ChatChannel
  },


  async leaveChannel(channelId: string): Promise<void> {
    await authManager.makeAuthenticatedRequest(`/api/chat/channels/${channelId}/leave`, { method: 'POST' })
  },

  async joinChannel(channelId: string): Promise<void> {
    await authManager.makeAuthenticatedRequest(`/api/chat/channels/${channelId}/join`, { method: 'POST' })
  },

  async getPublicChannels(): Promise<ChatChannel[]> {
    return await authManager.makeAuthenticatedRequest('/api/chat/public-channels') as ChatChannel[]
  },

  async createDirectChannel(userId: string): Promise<ChatChannel> {
    return await authManager.makeAuthenticatedRequest('/api/chat/direct', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId })
    }) as ChatChannel
  },

  async inviteUserToChannel(channelId: string, userId: string): Promise<void> {
    await authManager.makeAuthenticatedRequest(`/api/chat/channels/${channelId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId })
    })
  },

  async getChannelParticipants(channelId: string): Promise<ChatChannelParticipant[]> {
    return await authManager.makeAuthenticatedRequest(`/api/chat/channels/${channelId}/participants`) as ChatChannelParticipant[]
  },

  // Messages
  async getMessages(channelId: string, limit = 50, offset = 0): Promise<MessageWithDetails[]> {
    const data = await authManager.makeAuthenticatedRequest(`/api/chat/channels/${channelId}/messages?limit=${limit}&offset=${offset}`) as (ChatMessage & {user_name: string})[]
    return data.map(message => ({ 
      ...message, 
      user: { id: message.user_id, full_name: message.user_name, email: '', avatar_url: '', status: 'online', last_seen: '' },
      reactions: [], 
      reply_to: undefined 
    })) as MessageWithDetails[]
  },

  async sendMessage(request: SendMessageRequest): Promise<ChatMessage> {
    return await authManager.makeAuthenticatedRequest(`/api/chat/channels/${request.channel_id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content: request.content, type: request.message_type || 'text' }) // Adapt to backend
    }) as ChatMessage
  },

  async editMessage(messageId: string, request: UpdateMessageRequest): Promise<ChatMessage> {
    return await authManager.makeAuthenticatedRequest(`/api/chat/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify(request)
    }) as ChatMessage
  },

  async deleteMessage(messageId: string): Promise<void> {
    await authManager.makeAuthenticatedRequest(`/api/chat/messages/${messageId}`, { method: 'DELETE' })
  },

  // Reactions
  async addReaction(messageId: string, emoji: string): Promise<void> {
    await authManager.makeAuthenticatedRequest(`/api/chat/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji })
    })
  },

  async removeReaction(messageId: string, emoji: string): Promise<void> {
    await authManager.makeAuthenticatedRequest(`/api/chat/messages/${messageId}/reactions/${emoji}`, { method: 'DELETE' })
  },

  // Presence
  async updatePresence(status: 'online' | 'away' | 'busy' | 'offline'): Promise<void> {
    await authManager.makeAuthenticatedRequest('/api/chat/presence', {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  },

  async getOnlineUsers(): Promise<ChatUser[]> {
    const data = await authManager.makeAuthenticatedRequest('/api/chat/online-users') as {id: string, name: string}[]
    return data.map(d => ({id: d.id, full_name: d.name, email: '', avatar_url: '', status: 'online', last_seen: ''}))
  },

  async getAllUsers(): Promise<ChatUser[]> {
    return await authManager.makeAuthenticatedRequest('/api/chat/users') as ChatUser[]
  },

  // Typing indicators (stubs)
  async startTyping(channelId: string): Promise<void> {
    await authManager.makeAuthenticatedRequest(`/api/chat/channels/${channelId}/typing/start`, { method: 'POST' })
  },

  async stopTyping(channelId: string): Promise<void> {
    await authManager.makeAuthenticatedRequest(`/api/chat/channels/${channelId}/typing/stop`, { method: 'POST' })
  },

  async getTypingUsers(channelId: string): Promise<TypingIndicator[]> {
    return await authManager.makeAuthenticatedRequest(`/api/chat/channels/${channelId}/typing`) as TypingIndicator[]
  },

  // Utility
  async markChannelAsRead(channelId: string): Promise<void> {
    await authManager.makeAuthenticatedRequest(`/api/chat/channels/${channelId}/read`, { method: 'POST' })
  },

  async getUnreadCount(): Promise<number> {
    const data = await authManager.makeAuthenticatedRequest('/api/chat/unread') as { unread: number }
    return data.unread
  },

  // File upload (keep Cloudinary)
  async uploadFile(file: File, onProgress?: (progress: { loaded: number; total: number }) => void): Promise<FileUploadResult> {
    try {
      const result = await uploadToCloudinary(file, onProgress)
      return {
        url: result.secure_url,
        public_id: '',
        format: file.type.split('/')[1] || 'unknown',
        bytes: file.size
      }
    } catch (error) {
      throw new Error('File upload failed')
    }
  },

  async sendFileMessage(channelId: string, file: File, caption?: string): Promise<ChatMessage> {
    const uploadResult = await this.uploadFile(file)
    let messageType = 'file'
    if (file.type.startsWith('image/')) messageType = 'image'
    return this.sendMessage({
      channel_id: channelId,
      content: caption || file.name,
      message_type: messageType as 'text' | 'image' | 'file' | 'system' // Type assertion
    })
  },

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/')
  },

  // Search and history (add if not stubbed)
  async searchMessages(query: string, channelIds?: string[], limit = 50, offset = 0): Promise<MessageSearchResult[]> {
    // Implement if backend adds endpoint
    return []
  },

  async getMessageHistory(channelId: string, beforeTimestamp?: string, limit = 50): Promise<MessageHistoryResult[]> {
    // Implement if backend adds endpoint
    return []
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

/* Real-time subscriptions using WebSocket */
export const chatRealtime = {
  subscribeToMessages(channelId: string, callback: (message: ChatMessage) => void) {
    const listener = (event: MessageEvent) => {
      const payload = JSON.parse(event.data)
      if (payload.channel_id === channelId && payload.type === 'new_message') {
        callback(payload.message)
      }
    }
    ws?.addEventListener('message', listener)
    return {
      unsubscribe: () => ws?.removeEventListener('message', listener)
    }
  },

  subscribeToPresence(callback: (presence: ChatUserPresence) => void) {
    const listener = (event: MessageEvent) => {
      const payload = JSON.parse(event.data)
      if (payload.type === 'presence_update') {
        callback(payload.presence)
      }
    }
    ws?.addEventListener('message', listener)
    return {
      unsubscribe: () => ws?.removeEventListener('message', listener)
    }
  },

  subscribeToChannelUpdates(callback: (channel: ChatChannel) => void) {
    const listener = (event: MessageEvent) => {
      const payload = JSON.parse(event.data)
      if (payload.type === 'channel_update') {
        callback(payload.channel)
      }
    }
    ws?.addEventListener('message', listener)
    return {
      unsubscribe: () => ws?.removeEventListener('message', listener)
    }
  },

  subscribeToTyping(channelId: string, callback: (typingUsers: TypingIndicator[]) => void) {
    const typingState: { [userId: string]: TypingIndicator } = {}

    const listener = (event: MessageEvent) => {
      const payload = JSON.parse(event.data)
      if (payload.channel_id === channelId) {
        if (payload.type === 'typing_start') {
          typingState[payload.user_id] = { user_id: payload.user_id, started_at: payload.timestamp } as TypingIndicator // Adapt
          callback(Object.values(typingState))
        } else if (payload.type === 'typing_stop') {
          delete typingState[payload.user_id]
          callback(Object.values(typingState))
        }
      }
    }
    ws?.addEventListener('message', listener)
    return {
      unsubscribe: () => ws?.removeEventListener('message', listener)
    }
  }
}
