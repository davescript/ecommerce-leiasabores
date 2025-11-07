import axios, { AxiosHeaders, type AxiosHeaderValue } from 'axios'
import { logger } from './logger'

function normalizeHeaders(input: unknown): AxiosHeaders {
  if (input instanceof AxiosHeaders) {
    return AxiosHeaders.from(input)
  }

  const headers = new AxiosHeaders()

  if (!input || typeof input !== 'object') {
    return headers
  }

  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (value === undefined || value === null) {
      continue
    }

    if (Array.isArray(value)) {
      const filtered = value.filter((item) => item !== undefined && item !== null).map((item) => String(item))
      if (filtered.length > 0) {
        headers.set(key, filtered as AxiosHeaderValue)
      }
      continue
    }

    if (value instanceof AxiosHeaders) {
      headers.set(key, value)
      continue
    }

    if (typeof value === 'object') {
      headers.set(key, JSON.stringify(value))
      continue
    }

    headers.set(key, value as AxiosHeaderValue)
  }

  return headers
}

// Configurar baseURL: usar proxy local em dev, ou API direta em produção
// SOLUÇÃO: Usar API direta em produção para evitar erro 405 do proxy
const getBaseURL = () => {
  // Se VITE_API_URL estiver definido, usar diretamente
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // Em desenvolvimento (localhost), usar proxy local
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return '/api'
    }
  }
  
  // Em produção, SEMPRE usar API direta do Worker
  // O proxy do Cloudflare Pages está causando erro 405
  return 'https://api.leiasabores.pt/api'
}

const baseURL = getBaseURL()
logger.debug('[API Client] Base URL:', baseURL)

const api = axios.create({
  baseURL,
  timeout: 30000, // 30 segundos para requisições mais lentas
})

api.interceptors.request.use((config) => {
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData
  const headers = normalizeHeaders(config.headers)
  headers.set('Accept', 'application/json')

  if (isFormData) {
    headers.delete('Content-Type')
  } else {
    headers.set('Content-Type', 'application/json')
  }

  config.headers = headers
  
  // Log para debug (apenas em desenvolvimento)
  logger.debug('[API Request]', {
    method: config.method?.toUpperCase(),
    url: (config.baseURL || '') + (config.url || ''),
  })
  
  return config
})

// Interceptor de resposta para melhor tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    logger.error('[API Error]', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
    })
    
    if (error.response) {
      // Erro com resposta do servidor
      const status = error.response.status
      const message = error.response.data?.error || error.response.data?.message || error.message
      
      if (status === 405) {
        logger.error('[API Error] Method Not Allowed (405):', {
          url: (error.config?.baseURL || '') + (error.config?.url || ''),
          method: error.config?.method,
        })
        return Promise.reject(new Error(`Método não permitido (405). URL: ${error.config?.baseURL || ''}${error.config?.url || ''}, Método: ${error.config?.method}`))
      }
      
      return Promise.reject(new Error(message || `Erro ${status}: ${error.message}`))
    } else if (error.request) {
      // Requisição feita mas sem resposta
      logger.error('[API Error] No response from server')
      return Promise.reject(new Error('Não foi possível conectar ao servidor. Verifique sua conexão.'))
    } else {
      // Erro ao configurar a requisição
      logger.error('[API Error] Request setup error:', error.message)
      return Promise.reject(new Error(error.message || 'Erro desconhecido'))
    }
  }
)

function setAuthToken(token: string | null) {
  const headers = normalizeHeaders(api.defaults.headers.common)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  } else {
    headers.delete('Authorization')
  }

  api.defaults.headers.common = headers
}

export { api, setAuthToken }
