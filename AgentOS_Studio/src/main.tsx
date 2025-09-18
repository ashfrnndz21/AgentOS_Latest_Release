
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import { ToastProvider } from './hooks/toast'
import { IndustryProvider } from './contexts/IndustryContext'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <IndustryProvider>
          <App />
        </IndustryProvider>
      </ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
