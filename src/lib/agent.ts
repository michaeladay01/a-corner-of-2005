/* Talking to the contact-playing model, from the page's side.

   The browser never sees an API key: it posts the transcript to the dev
   server, which holds the key and calls the API. If no key is configured the
   status probe says so once and the app falls back to the scripted replies
   it has always had, so nothing breaks when you just want to look around. */

export type Turn = { from: 'me' | 'them'; text: string }

let available: boolean | null = null
let probe: Promise<boolean> | null = null

/** Whether a live contact is answering. Cached after the first probe. */
export function agentReady(): boolean {
  return available === true
}

export function checkAgent(): Promise<boolean> {
  if (available !== null) return Promise.resolve(available)
  probe ??= fetch('/api/agent/status')
    .then((r) => (r.ok ? r.json() : { available: false }))
    .then((d: { available?: boolean }) => {
      available = Boolean(d.available)
      return available
    })
    .catch(() => {
      available = false
      return false
    })
  return probe
}

export type ContactCard = { name: string; email: string; psm?: string; music?: string }

export async function askAgent(
  contactId: string,
  history: Turn[],
  userName: string,
  contact: ContactCard
): Promise<string[] | null> {
  try {
    const res = await fetch('/api/agent/reply', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contactId, history, userName, contact }),
    })
    if (!res.ok) {
      // A key that stops working mid-session drops us back to the scripts.
      if (res.status === 503) available = false
      return null
    }
    const data = (await res.json()) as { lines?: string[] }
    return Array.isArray(data.lines) && data.lines.length ? data.lines : null
  } catch {
    return null
  }
}
