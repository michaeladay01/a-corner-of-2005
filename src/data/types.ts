export type Presence =
  | 'online'
  | 'busy'
  | 'away'
  | 'brb'
  | 'lunch'
  | 'phone'
  | 'offline'

export type Contact = {
  id: string
  name: string
  email: string
  presence: Presence
  psm: string
  group: string
  picture: string
  blocked?: boolean
  music?: string
}

export type Message = {
  id: string
  from: 'me' | string
  text: string
  at: number
  kind?: 'text' | 'system' | 'nudge' | 'wink'
  font?: { family: string; color: string; bold?: boolean; italic?: boolean }
}

export type Conversation = {
  contactId: string
  messages: Message[]
  queue: number
  typing: boolean
  unread: number
}
