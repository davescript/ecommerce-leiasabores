export function useAuth() {
  const logout = () => {
    localStorage.removeItem('admin_token')
    window.location.href = '/admin'
  }

  const isAuthenticated = () => {
    return !!localStorage.getItem('admin_token')
  }

  return {
    logout,
    isAuthenticated,
  }
}

