import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { NetworkProvider } from './contexts/NetworkContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <NetworkProvider>
        <App />
      </NetworkProvider>
    </ThemeProvider>
  </StrictMode>,
)
