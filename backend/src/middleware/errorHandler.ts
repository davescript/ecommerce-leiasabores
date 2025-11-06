import { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'

export const errorHandler = (err: Error | HTTPException, c: Context) => {
  console.error('Error:', err)

  if (err instanceof HTTPException) {
    return err.getResponse()
  }

  return c.json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  }, 500)
}
