// Tipos mínimos locais para evitar dependência de tipos externos
type FunctionContext = {
  request: Request
}

export const onRequest = async (ctx: FunctionContext) => {
  const { request } = ctx
  const url = new URL(request.url)

  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': url.origin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Max-Age': '86400',
  }

  // Preflight CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  // Proxy para a API pública no subdomínio
  const upstreamBase = 'https://api.leiasabores.pt/api'
  const path = url.pathname.replace(/^\/api/, '')
  const target = upstreamBase + path + (url.search || '')

  // Reencaminhar a requisição
  const init: RequestInit = { method: request.method, headers: request.headers }
  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = await request.clone().arrayBuffer()
  }

  const resp = await fetch(target, init)
  const headers = new Headers(resp.headers)
  // Garantir cabeçalhos CORS para o browser (mesmo não necessários em same-origin)
  Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, v))

  return new Response(resp.body, { status: resp.status, headers })
}