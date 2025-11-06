/// <reference types="vite/client" />

// Extensões para variáveis de ambiente do Vite usadas no projeto
interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_APP_NAME?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}