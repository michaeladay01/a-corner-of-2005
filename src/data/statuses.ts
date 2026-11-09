import type { Presence } from './types'

export const STATUS_LABEL: Record<Presence, string> = {
  online: 'Online',
  busy: 'Busy',
  away: 'Away',
  brb: 'Be Right Back',
  lunch: 'Out to Lunch',
  phone: 'On the Phone',
  offline: 'Appear Offline',
}

export const STATUS_ORDER: Presence[] = [
  'online',
  'busy',
  'away',
  'brb',
  'lunch',
  'phone',
  'offline',
]

// Which bucket a presence falls into in the contact list.
export function bucket(p: Presence): 'online' | 'offline' {
  return p === 'offline' ? 'offline' : 'online'
}

export function isIdle(p: Presence) {
  return p === 'away' || p === 'brb' || p === 'lunch' || p === 'phone'
}
