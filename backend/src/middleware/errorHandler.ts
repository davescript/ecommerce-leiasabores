import { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { WorkerBindings } from '../types/bindings'

/**
 * Error handler robusto com logging detalhado e proteção de informações sensíveis
 */
export const errorHandler = (err: Error | HTTPException, c: Context) => {
  const env = c.env as unknown as WorkerBindings
  const isDevelopment = env.ENVIRONMENT === 'development'
  
  // Log detalhado do erro
  console.error('❌ Unhandled error:', {
    message: err.message,
    name: err.name,
    stack: isDevelopment ? err.stack : undefined,
    url: c.req.url,
    method: c.req.method,
    timestamp: new Date().toISOString(),
  })

  // Se for HTTPException do Hono, retornar resposta apropriada
  if (err instanceof HTTPException) {
    return err.getResponse()
  }

  // Não expor detalhes de erro em produção
  const errorMessage = isDevelopment 
    ? err.message 
    : 'Erro interno do servidor. Por favor, tente novamente mais tarde.'

  // Não expor stack trace em produção
  const errorResponse: Record<string, unknown> = {
    error: 'Internal Server Error',
    message: errorMessage,
  }

  // Adicionar debugId para rastreamento
  if (!isDevelopment) {
    const debugId = crypto.randomUUID().substring(0, 8)
    errorResponse.debugId = debugId
    console.error('Debug ID for error:', debugId)
  }

  return c.json(errorResponse, 500)
}
