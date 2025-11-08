import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
  permissions: string[]
}

interface AdminState {
  user: AdminUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (user: AdminUser, accessToken: string, refreshToken: string) => void
  logout: () => void
  updateUser: (user: Partial<AdminUser>) => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('admin_access_token', accessToken)
        localStorage.setItem('admin_refresh_token', refreshToken)
        set({ user, accessToken, refreshToken, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('admin_access_token')
        localStorage.removeItem('admin_refresh_token')
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      },
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

