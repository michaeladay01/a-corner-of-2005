/* "Planos de Fundo" — the background pictures you could set behind a
   conversation in Messenger 6.2, which everyone did and which made the text
   nearly unreadable. Drawn as gradients rather than shipped as photos. */

export type Background = {
  id: string
  name: string
  /** A CSS background value painted behind the whole window. */
  css: string
}

export const BACKGROUNDS: Background[] = [
  { id: 'none', name: 'No background', css: 'linear-gradient(to bottom, #eaf3fb, #cfe2f4)' },
  {
    id: 'snow',
    name: 'Snowboarder',
    css:
      'radial-gradient(circle at 72% 18%, rgba(255,255,255,0.95) 0 12%, rgba(255,255,255,0) 40%),' +
      'linear-gradient(160deg, #6fa8dc 0%, #9fc6e8 38%, #e8f1fa 62%, #ffffff 100%)',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    css: 'linear-gradient(to bottom, #2b3a6b 0%, #7d5a94 35%, #e2806a 68%, #ffc98a 100%)',
  },
  {
    id: 'hearts',
    name: 'Hearts',
    css:
      'radial-gradient(circle at 20% 30%, rgba(255,120,170,0.45) 0 6%, rgba(255,120,170,0) 7%),' +
      'radial-gradient(circle at 70% 60%, rgba(255,120,170,0.4) 0 5%, rgba(255,120,170,0) 6%),' +
      'radial-gradient(circle at 45% 85%, rgba(255,120,170,0.35) 0 4%, rgba(255,120,170,0) 5%),' +
      'linear-gradient(to bottom, #ffe9f2, #ffd0e2)',
  },
  {
    id: 'flames',
    name: 'Flames',
    css:
      'radial-gradient(ellipse at 50% 120%, #ffd34d 0 18%, #f07c20 38%, #c0341a 62%, #3a0d06 100%)',
  },
  {
    id: 'space',
    name: 'Space',
    css:
      'radial-gradient(circle at 18% 22%, #fff 0 0.4%, rgba(255,255,255,0) 1%),' +
      'radial-gradient(circle at 62% 14%, #fff 0 0.3%, rgba(255,255,255,0) 1%),' +
      'radial-gradient(circle at 80% 56%, #fff 0 0.35%, rgba(255,255,255,0) 1%),' +
      'radial-gradient(circle at 34% 72%, #fff 0 0.3%, rgba(255,255,255,0) 1%),' +
      'linear-gradient(to bottom, #0b1133, #1d2a5e 55%, #3a2a6b 100%)',
  },
]

export function backgroundCss(id: string): string {
  return (BACKGROUNDS.find((b) => b.id === id) ?? BACKGROUNDS[0]).css
}
