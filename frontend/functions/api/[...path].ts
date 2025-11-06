// Cloudflare Pages Functions handler
// @ts-ignore - PagesFunction type is provided by Cloudflare runtime
export const onRequest = async ({ request }: { request: Request }) => {
  const url = new URL(request.url)
  
  // Log para debug
  console.log(`[Proxy] ${request.method} ${url.pathname}`)

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
  const upstreamBase = 'https://api.leiasabores.pt'
  // Remover /api do pathname e reconstruir
  const path = url.pathname.replace(/^\/api/, '')
  const target = `${upstreamBase}/api${path}${url.search || ''}`
  
  console.log(`[Proxy] Target: ${target}, Method: ${request.method}`)

  // Preparar headers para o upstream, removendo headers que não devem ser reenviados
  const upstreamHeaders = new Headers()
  for (const [key, value] of request.headers.entries()) {
    // Não reenviar headers de host, connection, etc
    if (!['host', 'connection', 'cf-ray', 'cf-connecting-ip', 'cf-visitor'].includes(key.toLowerCase())) {
      upstreamHeaders.set(key, value)
    }
  }

  // Reencaminhar a requisição com método, headers e body corretos
  const init: RequestInit = {
    method: request.method,
    headers: upstreamHeaders,
  }

  // Para métodos que podem ter body (POST, PUT, PATCH, DELETE)
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    try {
      const body = await request.clone().arrayBuffer()
      if (body.byteLength > 0) {
        init.body = body
      }
    } catch (error) {
      console.error('Error reading request body:', error)
    }
  }

  try {
    console.log(`[Proxy] Fetching: ${target} with method ${init.method}`)
    const resp = await fetch(target, init)
    
    console.log(`[Proxy] Response status: ${resp.status} ${resp.statusText}`)
    
    const headers = new Headers(resp.headers)
    
    // Garantir cabeçalhos CORS para o browser
    Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, v))
    
    // Garantir que Content-Type seja preservado
    if (resp.headers.get('content-type')) {
      headers.set('Content-Type', resp.headers.get('content-type')!)
    }

    // Clonar o body para poder ler e retornar
    const body = await resp.clone().arrayBuffer()
    
    return new Response(body, { 
      status: resp.status, 
      statusText: resp.statusText,
      headers 
    })
  } catch (error) {
    console.error('[Proxy] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Proxy] Error details:', { target, method: init.method, errorMessage })
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to proxy request', 
        message: errorMessage,
        target,
        method: init.method
      }),
      { 
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    )
  }
}