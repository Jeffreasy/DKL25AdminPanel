import { supabase } from '../../../lib/supabase'
import { uploadToCloudinary } from '../../../lib/cloudinary/cloudinaryClient'
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
  MessageHistoryResult
} from '../types'

// Channel operations
export const chatService = {
  // Channels
  async getChannels(): Promise<ChannelWithDetails[]> {
    const { data, error } = await supabase
      .from('chat_channels')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })

    if (error) throw error

    // Get participants and last messages separately
    const channelsWithDetails = await Promise.all(
      (data || []).map(async (channel) => {
        const [participants, lastMessage] = await Promise.all([
          supabase
            .from('chat_channel_participants')
            .select('*')
            .eq('channel_id', channel.id),
          supabase
            .from('chat_messages')
            .select(`
              *,
              user:auth.users(id, email, full_name, avatar_url)
            `)
            .eq('channel_id', channel.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
        ])

        return {
          ...channel,
          participants: participants.data || [],
          participant_count: participants.data?.length || 0,
          last_message: lastMessage.data || undefined
        }
      })
    )

    return channelsWithDetails
  },

  async createChannel(request: CreateChannelRequest): Promise<ChatChannel> {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('chat_channels')
      .insert({
        name: request.name,
        description: request.description,
        type: request.type,
        created_by: userId
      })
      .select()
      .single()

    if (error) throw error

    // Add creator as channel participant
    const { error: participantError } = await supabase
      .from('chat_channel_participants')
      .insert({
        channel_id: data.id,
        user_id: userId,
        role: 'owner'
      })

    if (participantError) {
      console.error('Failed to add creator as participant:', participantError)
      // Don't throw here as the channel was created successfully
    }

    return data
  },

  async joinChannel(channelId: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('chat_channel_participants')
      .insert({
        channel_id: channelId,
        user_id: userId,
        role: 'member'
      })

    if (error) throw error
  },

  async leaveChannel(channelId: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('chat_channel_participants')
      .delete()
      .eq('channel_id', channelId)
      .eq('user_id', userId)

    if (error) throw error
  },

  // Messages
  async getMessages(channelId: string, limit = 50, offset = 0): Promise<MessageWithDetails[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        user:auth.users(id, email, full_name, avatar_url)
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    // Get reactions and reply_to separately for each message
    const messagesWithDetails = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data || []).map(async (message: any) => {
        const [reactions, replyTo] = await Promise.all([
          supabase
            .from('chat_message_reactions')
            .select(`
              id,
              emoji,
              user:auth.users(id, email, full_name, avatar_url)
            `)
            .eq('message_id', message.id),
          message.reply_to_id
            ? supabase
                .from('chat_messages')
                .select(`
                  id,
                  content,
                  user:auth.users(id, email, full_name, avatar_url)
                `)
                .eq('id', message.reply_to_id)
                .single()
            : Promise.resolve(null)
        ])

        return {
          ...message,
          reactions: reactions.data || [],
          reply_to: replyTo?.data || undefined
        } as MessageWithDetails
      })
    )

    // Reverse to show oldest first
    return messagesWithDetails.reverse()
  },

  async sendMessage(request: SendMessageRequest): Promise<ChatMessage> {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        channel_id: request.channel_id,
        user_id: userId,
        content: request.content,
        message_type: request.message_type || 'text',
        file_url: request.file_url,
        file_name: request.file_name,
        file_size: request.file_size,
        reply_to_id: request.reply_to_id
      })
      .select()
      .single()

    if (error) throw error

    // Update channel's updated_at timestamp
    await supabase
      .from('chat_channels')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', request.channel_id)

    return data
  },

  async editMessage(messageId: string, request: UpdateMessageRequest): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .update({
        content: request.content,
        edited_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId)

    if (error) throw error
  },

  // Reactions
  async addReaction(messageId: string, emoji: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('chat_message_reactions')
      .insert({
        message_id: messageId,
        user_id: userId,
        emoji
      })

    if (error) throw error
  },

  async removeReaction(messageId: string, emoji: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('chat_message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('emoji', emoji)

    if (error) throw error
  },

  // Presence
  async updatePresence(status: 'online' | 'away' | 'busy' | 'offline'): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('chat_user_presence')
      .upsert({
        user_id: userId,
        status,
        last_seen: new Date().toISOString()
      })

    if (error) throw error
  },

  async getOnlineUsers(): Promise<ChatUser[]> {
    const { data, error } = await supabase
      .from('chat_user_presence')
      .select('user_id, status, last_seen')
      .in('status', ['online', 'away'])
      .order('last_seen', { ascending: false })

    if (error) throw error

    // Get user details separately
    const users = await Promise.all(
      (data || []).map(async (presence) => {
        const { data: userData } = await supabase
          .from('auth.users')
          .select('id, email, full_name, avatar_url')
          .eq('id', presence.user_id)
          .single()

        return {
          id: userData?.id || presence.user_id,
          email: userData?.email || '',
          full_name: userData?.full_name || undefined,
          avatar_url: userData?.avatar_url || undefined,
          status: presence.status as 'online' | 'away' | 'busy' | 'offline',
          last_seen: presence.last_seen
        }
      })
    )

    return users
  },

  // Typing indicators
  async startTyping(channelId: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')

    // Use database function for persistent typing state
    const { error } = await supabase.rpc('start_typing', {
      channel_id: channelId,
      user_id: userId
    })

    if (error) throw error

    // Also broadcast for real-time updates
    await supabase.channel(`typing:${channelId}`).send({
      type: 'broadcast',
      event: 'typing_start',
      payload: {
        user_id: userId,
        channel_id: channelId,
        timestamp: new Date().toISOString()
      }
    })
  },

  async stopTyping(channelId: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')

    // Use database function for persistent typing state
    const { error } = await supabase.rpc('stop_typing', {
      channel_id: channelId,
      user_id: userId
    })

    if (error) throw error

    // Also broadcast for real-time updates
    await supabase.channel(`typing:${channelId}`).send({
      type: 'broadcast',
      event: 'typing_stop',
      payload: {
        user_id: userId,
        channel_id: channelId,
        timestamp: new Date().toISOString()
      }
    })
  },

  async getTypingUsers(channelId: string): Promise<TypingIndicator[]> {
    const { data, error } = await supabase
      .from('chat_typing_indicators')
      .select(`
        id,
        channel_id,
        user_id,
        started_at
      `)
      .eq('channel_id', channelId)
      .gt('started_at', new Date(Date.now() - 10000).toISOString()) // Last 10 seconds

    if (error) throw error

    // Get user details separately
    const typingUsers = await Promise.all(
      (data || []).map(async (indicator) => {
        const { data: userData } = await supabase
          .from('auth.users')
          .select('id, email, full_name, avatar_url')
          .eq('id', indicator.user_id)
          .single()

        return {
          id: indicator.id,
          channel_id: indicator.channel_id,
          user_id: indicator.user_id,
          started_at: indicator.started_at,
          user: userData ? {
            id: userData.id,
            email: userData.email,
            full_name: userData.full_name,
            avatar_url: userData.avatar_url
          } : undefined
        }
      })
    )

    return typingUsers
  },

  // Utility functions
  async markChannelAsRead(channelId: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')

    const { error } = await supabase.rpc('update_last_seen', {
      channel_id: channelId,
      user_id: userId
    })

    if (error) throw error
  },

  async getUnreadCount(): Promise<number> {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')

    const { data, error } = await supabase.rpc('get_unread_message_count', {
      user_id: userId
    })

    if (error) throw error
    return data || 0
  },

  // File upload functionality
  async uploadFile(file: File, onProgress?: (progress: { loaded: number; total: number }) => void): Promise<FileUploadResult> {
    try {
      const result = await uploadToCloudinary(file, onProgress)
      return {
        url: result.secure_url,
        public_id: '', // Cloudinary doesn't return this in the basic response
        format: file.type.split('/')[1] || 'unknown',
        bytes: file.size
      }
    } catch (error) {
      console.error('File upload failed:', error)
      throw new Error('Bestand upload mislukt')
    }
  },

  async sendFileMessage(channelId: string, file: File, caption?: string): Promise<ChatMessage> {
    try {
      // Upload file first
      const uploadResult = await this.uploadFile(file)

      // Determine message type based on file type
      let messageType: 'text' | 'image' | 'file' | 'system' = 'file'
      if (file.type.startsWith('image/')) {
        messageType = 'image'
      }

      // Send message with file
      return await this.sendMessage({
        channel_id: channelId,
        content: caption || file.name,
        message_type: messageType,
        file_url: uploadResult.url,
        file_name: file.name,
        file_size: file.size
      })
    } catch (error) {
      console.error('File message send failed:', error)
      throw error
    }
  },

  // Utility function to determine if file is an image
  isImageFile(file: File): boolean {
    return file.type.startsWith('image/')
  },

  // Message search functionality
  async searchMessages(
    query: string,
    channelIds?: string[],
    limit = 50,
    offset = 0
  ): Promise<MessageSearchResult[]> {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')

    const { data, error } = await supabase.rpc('search_chat_messages', {
      search_query: query,
      channel_ids: channelIds,
      auth_user_id: userId,
      limit_count: limit,
      offset_count: offset
    })

    if (error) throw error
    return data || []
  },

  // Get message history with pagination
  async getMessageHistory(
    channelId: string,
    beforeTimestamp?: string,
    limit = 50
  ): Promise<MessageHistoryResult[]> {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')

    const { data, error } = await supabase.rpc('get_message_history', {
      p_channel_id: channelId,
      p_user_id: userId,
      before_timestamp: beforeTimestamp || null,
      limit_count: limit
    })

    if (error) throw error

    // Return the data as MessageHistoryResult (already in correct format from database function)
    return data || []
  },

  // Utility function to format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Real-time subscriptions
export const chatRealtime = {
  subscribeToMessages(channelId: string, callback: (message: ChatMessage) => void) {
    return supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => callback(payload.new as ChatMessage)
      )
      .subscribe()
  },

  subscribeToPresence(callback: (presence: ChatUserPresence) => void) {
    return supabase
      .channel('presence')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_user_presence'
        },
        (payload) => callback(payload.new as ChatUserPresence)
      )
      .subscribe()
  },

  subscribeToChannelUpdates(callback: (channel: ChatChannel) => void) {
    return supabase
      .channel('channels')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_channels'
        },
        (payload) => callback(payload.new as ChatChannel)
      )
      .subscribe()
  },

  subscribeToTyping(channelId: string, callback: (typingUsers: TypingIndicator[]) => void) {
    const typingState: { [userId: string]: TypingIndicator } = {}

    return supabase
      .channel(`typing:${channelId}`)
      .on(
        'broadcast',
        { event: 'typing_start' },
        async (payload) => {
          const { user_id, channel_id } = payload.payload
          if (channel_id === channelId && user_id) {
            // Get user details
            const { data: userData } = await supabase
              .from('auth.users')
              .select('id, email, full_name, avatar_url')
              .eq('id', user_id)
              .single()

            typingState[user_id] = {
              id: `${user_id}-${channel_id}`,
              channel_id,
              user_id,
              started_at: payload.payload.timestamp,
              user: userData ? {
                id: userData.id,
                email: userData.email,
                full_name: userData.full_name,
                avatar_url: userData.avatar_url
              } : undefined
            }

            // Auto-remove typing indicator after 3 seconds
            setTimeout(() => {
              delete typingState[user_id]
              callback(Object.values(typingState))
            }, 3000)

            callback(Object.values(typingState))
          }
        }
      )
      .on(
        'broadcast',
        { event: 'typing_stop' },
        (payload) => {
          const { user_id } = payload.payload
          if (user_id && typingState[user_id]) {
            delete typingState[user_id]
            callback(Object.values(typingState))
          }
        }
      )
      .subscribe()
  }
}