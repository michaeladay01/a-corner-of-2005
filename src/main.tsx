import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { StoreProvider } from './state/store'
import './styles/xp.css'
import './styles/msn.css'
import './styles/sites.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>
)
