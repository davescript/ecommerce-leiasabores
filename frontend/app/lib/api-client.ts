import axios, { AxiosHeaders, type AxiosHeaderValue } from 'axios'

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

// Forçamos same-origin para eliminar CORS: todas as chamadas passam por /api (Pages Functions)
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
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
  return config
})

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
