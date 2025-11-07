/**
 * Utilitários para validação e formatação de telefone
 */

/**
 * Valida formato de telefone português
 * Aceita: +351, 00351, ou números locais
 */
export function isValidPortuguesePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false
  
  const cleaned = phone.trim().replace(/[\s()-]/g, '')
  
  // Formato: +351XXXXXXXXX ou 00351XXXXXXXXX ou 9XXXXXXXX
  const patterns = [
    /^\+3519\d{8}$/, // +351 9XXXXXXXX
    /^003519\d{8}$/, // 00351 9XXXXXXXX
    /^9\d{8}$/, // 9XXXXXXXX (formato local)
    /^2\d{8}$/, // 2XXXXXXXX (fixo)
  ]
  
  return patterns.some(pattern => pattern.test(cleaned))
}

/**
 * Formata telefone para exibição
 */
export function formatPhone(phone: string): string {
  if (!phone) return ''
  
  const cleaned = phone.replace(/[\s()-]/g, '')
  
  // Se começa com +351 ou 00351, manter
  if (cleaned.startsWith('+351')) {
    return cleaned.replace(/(\+351)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4')
  }
  if (cleaned.startsWith('00351')) {
    return cleaned.replace(/(00351)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4')
  }
  
  // Formato local: 9XXXXXXXX
  if (cleaned.length === 9 && /^[29]\d{8}$/.test(cleaned)) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')
  }
  
  return phone
}

/**
 * Sanitiza telefone removendo caracteres inválidos
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return ''
  
  // Manter apenas números, + e espaços
  // Remove caracteres inválidos mas mantém espaços
  return phone.replace(/[^\d+\s]/g, '').replace(/\s+/g, ' ').trim()
}

