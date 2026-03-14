import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0F0F1F',
            color: '#F5F0E8',
            border: '1px solid rgba(196,150,58,0.3)',
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#C4963A', secondary: '#1A1A2E' } },
          error: { iconTheme: { primary: '#E76F51', secondary: '#1A1A2E' } },
        }}
      />
    </BrowserRouter>
  </StrictMode>
)