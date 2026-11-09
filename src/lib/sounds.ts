// Sounds are synthesised with the Web Audio API so the build ships no audio
// files. Nothing is created until the first user gesture asks for a sound.

type SoundName =
  | 'signin'
  | 'signout'
  | 'message'
  | 'send'
  | 'nudge'
  | 'online'
  | 'offline'
  | 'error'
  | 'startup'
  | 'click'

let ctx: AudioContext | null = null
let muted = false

export function setMuted(value: boolean) {
  muted = value
}

function audio(): AudioContext | null {
  if (muted) return null
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

type ToneOptions = {
  freq: number
  at?: number
  dur?: number
  type?: OscillatorType
  gain?: number
  glideTo?: number
}

function tone(ac: AudioContext, o: ToneOptions) {
  const t0 = ac.currentTime + (o.at ?? 0)
  const dur = o.dur ?? 0.16
  const osc = ac.createOscillator()
  const amp = ac.createGain()
  osc.type = o.type ?? 'sine'
  osc.frequency.setValueAtTime(o.freq, t0)
  if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(o.glideTo, t0 + dur)
  const peak = o.gain ?? 0.16
  amp.gain.setValueAtTime(0.0001, t0)
  amp.gain.exponentialRampToValueAtTime(peak, t0 + 0.012)
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(amp).connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

function noise(ac: AudioContext, dur: number, gain = 0.05, at = 0) {
  const frames = Math.floor(ac.sampleRate * dur)
  const buffer = ac.createBuffer(1, frames, ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
  const src = ac.createBufferSource()
  src.buffer = buffer
  const amp = ac.createGain()
  amp.gain.value = gain
  src.connect(amp).connect(ac.destination)
  src.start(ac.currentTime + at)
}

export function play(name: SoundName) {
  const ac = audio()
  if (!ac) return
  switch (name) {
    // The familiar rising four-note sign-in.
    case 'signin':
      tone(ac, { freq: 587.33, dur: 0.12, type: 'triangle' })
      tone(ac, { freq: 880, at: 0.11, dur: 0.12, type: 'triangle' })
      tone(ac, { freq: 1174.66, at: 0.22, dur: 0.14, type: 'triangle' })
      tone(ac, { freq: 1567.98, at: 0.34, dur: 0.3, type: 'triangle', gain: 0.13 })
      break
    case 'signout':
      tone(ac, { freq: 1174.66, dur: 0.12, type: 'triangle' })
      tone(ac, { freq: 880, at: 0.11, dur: 0.12, type: 'triangle' })
      tone(ac, { freq: 587.33, at: 0.22, dur: 0.26, type: 'triangle' })
      break
    // The message blip: two quick knocks.
    case 'message':
      tone(ac, { freq: 1046.5, dur: 0.09, type: 'sine', gain: 0.18 })
      tone(ac, { freq: 1396.91, at: 0.09, dur: 0.12, type: 'sine', gain: 0.16 })
      break
    case 'send':
      tone(ac, { freq: 1567.98, dur: 0.06, type: 'sine', gain: 0.07 })
      break
    case 'nudge':
      tone(ac, { freq: 180, dur: 0.1, type: 'square', gain: 0.1, glideTo: 90 })
      tone(ac, { freq: 180, at: 0.12, dur: 0.1, type: 'square', gain: 0.1, glideTo: 90 })
      tone(ac, { freq: 180, at: 0.24, dur: 0.14, type: 'square', gain: 0.1, glideTo: 70 })
      break
    case 'online':
      tone(ac, { freq: 783.99, dur: 0.1, type: 'triangle', gain: 0.12 })
      tone(ac, { freq: 1046.5, at: 0.1, dur: 0.16, type: 'triangle', gain: 0.12 })
      break
    case 'offline':
      tone(ac, { freq: 659.25, dur: 0.1, type: 'triangle', gain: 0.1 })
      tone(ac, { freq: 440, at: 0.1, dur: 0.18, type: 'triangle', gain: 0.1 })
      break
    case 'error':
      tone(ac, { freq: 311.13, dur: 0.22, type: 'square', gain: 0.08 })
      tone(ac, { freq: 233.08, at: 0.2, dur: 0.26, type: 'square', gain: 0.08 })
      break
    case 'click':
      noise(ac, 0.03, 0.03)
      break
    // The Windows XP startup chime: airy pad plus a bell figure.
    case 'startup': {
      noise(ac, 1.6, 0.012)
      const notes: [number, number][] = [
        [659.25, 0],
        [987.77, 0.18],
        [1318.51, 0.36],
        [1975.53, 0.54],
        [1318.51, 0.86],
        [987.77, 1.02],
      ]
      for (const [freq, at] of notes) {
        tone(ac, { freq, at, dur: 0.9, type: 'sine', gain: 0.075 })
        tone(ac, { freq: freq / 2, at, dur: 1.1, type: 'triangle', gain: 0.035 })
      }
      break
    }
  }
}
