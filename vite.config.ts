import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { msnAgent } from './server/chat'

// The desktop is also built into the blog next door, where it is served from
// /xp/ rather than the root. BASE sets that; locally it stays '/'.
export default defineConfig({
  base: process.env.XP_BASE ?? '/',
  plugins: [react(), msnAgent()],
})
