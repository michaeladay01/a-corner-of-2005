/* Files in public/ are referenced by paths built at runtime, which means they
   do not go through the bundler's own rewriting. When the desktop is served
   from somewhere other than the root — the blog serves it from /xp/ — a bare
   "/logos/msn.png" points at the host's root and quietly 404s, and every
   picture falls back to its drawn stand-in. Going through here keeps them
   pointed at wherever this copy actually lives. */
const BASE = import.meta.env.BASE_URL || '/'

export function asset(path: string) {
  return `${BASE}${path.replace(/^\/+/, '')}`
}
