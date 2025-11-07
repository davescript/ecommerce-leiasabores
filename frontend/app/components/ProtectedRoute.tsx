import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
}

/**
 * Componente para proteger rotas que requerem autenticação
 * Por enquanto, apenas verifica se há token no localStorage
 * Em produção, deve validar o token com o backend
 */
export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    if (!requireAuth) {
      setIsAuthenticated(true)
      return
    }

    // Verificar se há token no localStorage
    const token = localStorage.getItem('admin_token')
    
    if (!token) {
      setIsAuthenticated(false)
      return
    }

    // Em produção, aqui deveria validar o token com o backend
    // Por enquanto, apenas verifica se existe
    // TODO: Adicionar validação real do token JWT
    try {
      // Verificar formato básico do JWT (tem 3 partes separadas por ponto)
      const parts = token.split('.')
      if (parts.length === 3) {
        // Verificar expiração básica (decodificar payload)
        const payload = JSON.parse(atob(parts[1]))
        const now = Math.floor(Date.now() / 1000)
        
        if (payload.exp && payload.exp > now) {
          setIsAuthenticated(true)
        } else {
          // Token expirado
          localStorage.removeItem('admin_token')
          setIsAuthenticated(false)
        }
      } else {
        setIsAuthenticated(false)
      }
    } catch {
      // Token inválido
      localStorage.removeItem('admin_token')
      setIsAuthenticated(false)
    }
  }, [requireAuth])

  // Mostrar loading enquanto verifica
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-sm text-gray-500">A verificar autenticação...</p>
        </div>
      </div>
    )
  }

  // Redirecionar se não autenticado
  if (!isAuthenticated && requireAuth) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

