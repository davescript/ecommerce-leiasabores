import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
}

/**
 * Componente para proteger rotas que requerem autenticação
 * Para o painel Admin, permite acesso mesmo sem token
 * (o próprio painel tem campo para configurar o token)
 */
export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const location = useLocation()
  
  // Inicializar estado baseado em requireAuth e rota admin
  const isAdminRoute = location.pathname.startsWith('/admin')
  const initialState = !requireAuth || isAdminRoute ? true : null
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(initialState)

  useEffect(() => {
    // Para rotas que não requerem autenticação, permitir acesso imediatamente
    if (!requireAuth) {
      setIsAuthenticated(true)
      return
    }

    // Para o admin, permitir acesso mesmo sem token
    // O próprio painel Admin tem campo para configurar o token
    // Verificar se estamos na rota /admin ou sub-rotas
    const isAdminRoute = location.pathname.startsWith('/admin')
    
    if (isAdminRoute) {
      // Permitir acesso ao admin sempre (ele gerencia seu próprio token)
      console.log('[ProtectedRoute] Admin route detected, allowing access')
      setIsAuthenticated(true)
      return
    }

    // Para outras rotas protegidas, verificar token
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
  }, [requireAuth, location.pathname])

  // Para rotas admin que não requerem auth, mostrar conteúdo imediatamente
  // Não mostrar InstantAdmin - usar o layout correto
  if (isAuthenticated === null && location.pathname.startsWith('/admin') && !requireAuth) {
    // Retornar children diretamente para rotas admin sem requireAuth
    return <>{children}</>
  }

  // Para rotas admin com requireAuth, mostrar loading apenas se ainda estiver verificando
  if (isAuthenticated === null && location.pathname.startsWith('/admin') && requireAuth) {
    // Mostrar loading simples, não InstantAdmin
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-sm text-gray-500">A carregar...</p>
        </div>
      </div>
    )
  }

  // Mostrar loading enquanto verifica (outras rotas)
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

  // Redirecionar se não autenticado (exceto admin)
  // IMPORTANTE: Admin sempre permite acesso, mesmo sem token
  if (!isAuthenticated && requireAuth) {
    const isAdminRoute = location.pathname.startsWith('/admin')
    if (!isAdminRoute) {
      return <Navigate to="/" replace />
    }
    // Se for admin e não autenticado, permitir acesso mesmo assim
    // O admin tem seu próprio sistema de autenticação
    return <>{children}</>
  }
  
  console.log('[ProtectedRoute] Rendering children, isAuthenticated:', isAuthenticated, 'path:', location.pathname)

  return <>{children}</>
}

