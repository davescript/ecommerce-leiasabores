import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/App'
import { AppProviders } from './app/AppProviders'
// Removido import direto de CSS do pacote sonner por incompatibilidade de export; estilos podem ser adicionados manualmente se necessário.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
)
