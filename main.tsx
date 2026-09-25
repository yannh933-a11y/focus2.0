import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { FocusProvider } from './context/FocusContext'
import App from './App'
import './styles/index.css'

registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FocusProvider><App /></FocusProvider>
  </React.StrictMode>,
)
