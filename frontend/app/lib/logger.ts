/**
 * Sistema de logging profissional
 * Remove console.logs e substitui por logging condicional
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private isDevelopment = import.meta.env.DEV
  private isProduction = import.meta.env.PROD

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true
    
    // Em produção, apenas errors e warns
    if (this.isProduction) {
      return level === 'error' || level === 'warn'
    }
    
    return false
  }

  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.shouldLog(level)) return

    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`

    switch (level) {
      case 'error':
        console.error(prefix, message, ...args)
        break
      case 'warn':
        console.warn(prefix, message, ...args)
        break
      case 'info':
        console.info(prefix, message, ...args)
        break
      case 'debug':
        console.debug(prefix, message, ...args)
        break
    }
  }

  debug(message: string, ...args: unknown[]): void {
    this.formatMessage('debug', message, ...args)
  }

  info(message: string, ...args: unknown[]): void {
    this.formatMessage('info', message, ...args)
  }

  warn(message: string, ...args: unknown[]): void {
    this.formatMessage('warn', message, ...args)
  }

  error(message: string, ...args: unknown[]): void {
    this.formatMessage('error', message, ...args)
  }
}

export const logger = new Logger()

