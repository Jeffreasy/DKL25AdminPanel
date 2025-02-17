declare module 'imapflow' {
  export interface ImapFlowOptions {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
  }

  export interface MessageEnvelope {
    date: Date
    subject: string
    from: Array<{ address: string; name?: string }>
    to: Array<{ address: string; name?: string }>
    messageId?: string
  }

  export interface FetchMessage {
    uid: string | number
    envelope: MessageEnvelope
    bodyStructure: any
  }

  export interface Mailbox {
    exists: number
  }

  export class ImapFlow {
    constructor(config: ImapFlowOptions)
    connect(): Promise<void>
    mailboxOpen(name: string): Promise<Mailbox>
    fetch(range: string, options: { envelope: boolean; bodyStructure: boolean }): AsyncIterableIterator<FetchMessage>
    logout(): Promise<void>
  }
} 