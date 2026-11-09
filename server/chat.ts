import Anthropic from '@anthropic-ai/sdk'
import { loadEnv, type Connect, type Plugin } from 'vite'
import { systemPromptFor, type ContactCard } from './persona'

/* The contact's replies come back from the model. The key is read from the
   environment here, on the server, and never reaches the browser — which is
   the whole reason this is a Vite middleware and not a fetch from the page. */

const MODEL = 'claude-opus-5-5'

type Turn = { from: 'me' | 'them'; text: string }

function hasKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN)
}

function readBody(req: Connect.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
      // A message window cannot produce a megabyte. If it has, something is wrong.
      if (data.length > 1_000_000) reject(new Error('body too large'))
    })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

/* The model is asked for one reply, which may be several short lines.
   Blank lines and stray quoting get dropped. */
function toLines(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^["']|["']$/g, ''))
    .slice(0, 4)
}

export function msnAgent(): Plugin {
  let client: Anthropic | null = null

  return {
    name: 'msn-agent',
    configureServer(server) {
      /* Pick the key up from a .env file as well as the shell, so you can drop
         it in a file next to the project and not think about exporting it.
         The empty prefix means plain ANTHROPIC_API_KEY is read, not just
         VITE_-prefixed names, and it stays on this side of the wire. */
      const env = loadEnv(server.config.mode, server.config.root, '')
      for (const name of ['ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN']) {
        if (!process.env[name] && env[name]) process.env[name] = env[name]
      }

      server.middlewares.use('/api/agent/status', (_req, res) => {
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify({ available: hasKey(), model: MODEL }))
      })

      server.middlewares.use('/api/agent/reply', async (req, res) => {
        res.setHeader('content-type', 'application/json')

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'POST only' }))
          return
        }
        if (!hasKey()) {
          res.statusCode = 503
          res.end(JSON.stringify({ error: 'no ANTHROPIC_API_KEY set' }))
          return
        }

        try {
          const body = JSON.parse(await readBody(req)) as {
            contactId?: string
            history?: Turn[]
            userName?: string
            contact?: ContactCard
          }
          const contactId = String(body.contactId ?? '')
          const history = Array.isArray(body.history) ? body.history : []
          if (!contactId || !history.length) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'contactId and history required' }))
            return
          }

          client ??= new Anthropic()

          // Consecutive same-role turns are legal, so the transcript maps straight
          // across without having to interleave filler.
          const messages: Anthropic.MessageParam[] = history
            .slice(-24)
            .map((turn) => ({
              role: turn.from === 'me' ? ('user' as const) : ('assistant' as const),
              content: turn.text,
            }))

          // The API needs the first message to be from the user.
          while (messages.length && messages[0].role !== 'user') messages.shift()
          if (!messages.length) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'history must reach a message from you' }))
            return
          }

          let system = systemPromptFor(contactId, body.contact)
          if (body.userName) {
            system += `\n\nThe person you are talking to has the display name "${body.userName}".`
          }

          const response = await client.messages.create({
            model: MODEL,
            max_tokens: 400,
            // Chat replies are short and want to be quick; low effort suits them.
            output_config: { effort: 'low' },
            system,
            messages,
          })

          if (response.stop_reason === 'refusal') {
            res.statusCode = 200
            res.end(JSON.stringify({ lines: ['...'], refused: true }))
            return
          }

          const text = response.content
            .filter((b): b is Anthropic.TextBlock => b.type === 'text')
            .map((b) => b.text)
            .join('\n')

          const lines = toLines(text)
          res.end(JSON.stringify({ lines: lines.length ? lines : ['...'] }))
        } catch (error) {
          server.config.logger.error(`[msn-agent] ${String(error)}`)
          res.statusCode = 502
          res.end(JSON.stringify({ error: String(error) }))
        }
      })
    },
  }
}
