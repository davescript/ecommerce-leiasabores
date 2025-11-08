import { Navigate, useLocation } from 'react-router-dom'
import { useAdminStore } from '@store/adminStore'
import { useEffect } from 'react'
import { authApi } from '@lib/admin-api'

export function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { user, setAuth } = useAdminStore()
  const accessToken = localStorage.getItem('admin_access_token')

  useEffect(() => {
    // If we have a token but no user, fetch user info
    if (accessToken && !user) {
      authApi
        .me()
        .then((response) => {
          const userData = response.data
          setAuth(
            userData,
            accessToken,
            localStorage.getItem('admin_refresh_token') || ''
          )
        })
        .catch(() => {
          // Token invalid, redirect to login
          localStorage.removeItem('admin_access_token')
          localStorage.removeItem('admin_refresh_token')
          window.location.href = '/admin/login'
        })
    }
  }, [accessToken, user, setAuth])

  // If no token at all, redirect to login
  if (!accessToken) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // If we have token but user not loaded yet, show loading
  if (accessToken && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

