import { useMemo, useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Ticket,
  Settings,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
  Shield,
} from 'lucide-react'
import { useAdminStore } from '@store/adminStore'
import { authApi } from '@lib/admin-api'
import { useTheme } from '@hooks/useTheme'
import { CategorySidebar } from './CategorySidebar'

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const { user, logout } = useAdminStore()

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('admin_refresh_token')
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
    logout()
    window.location.href = '/admin/login'
  }

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Produtos', icon: Package, path: '/admin/products' },
    { name: 'Pedidos', icon: ShoppingCart, path: '/admin/orders' },
    { name: 'Clientes', icon: Users, path: '/admin/customers' },
    { name: 'Categorias', icon: FolderTree, path: '/admin/categories' },
    { name: 'Cupons', icon: Ticket, path: '/admin/coupons' },
    { name: 'Usuários Admin', icon: Shield, path: '/admin/users', adminOnly: true },
    { name: 'Configurações', icon: Settings, path: '/admin/settings' },
  ]

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  const pageTitle = useMemo(() => {
    const map: Record<string, string> = {
      '/admin': 'Dashboard',
      '/admin/products': 'Produtos',
      '/admin/orders': 'Pedidos',
      '/admin/customers': 'Clientes',
      '/admin/categories': 'Categorias',
      '/admin/coupons': 'Cupons',
      '/admin/users': 'Usuários Admin',
      '/admin/settings': 'Configurações',
    }
    const key = Object.keys(map).find((k) => location.pathname.startsWith(k)) || '/admin'
    return map[key]
  }, [location.pathname])

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } fixed inset-y-0 left-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Admin Panel
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1 mb-4">
            {navItems.map((item) => {
              // Only show admin-only items to admins
              if (item.adminOnly && user?.role !== 'admin') {
                return null
              }

              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span className="font-medium">{item.name}</span>}
                </Link>
              )
            })}
          </ul>
          
          {/* Category Sidebar - Only show on products page */}
          {sidebarOpen && location.pathname.startsWith('/admin/products') && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <CategorySidebar />
            </div>
          )}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          {sidebarOpen && user && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              {sidebarOpen && <span className="text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut size={18} />
              {sidebarOpen && <span className="text-sm">Sair</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-20 md:ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/70 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Abrir menu"
              >
                <Menu size={18} />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Admin</p>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{pageTitle}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1.5">
                <input
                  type="search"
                  placeholder="Pesquisar…"
                  className="bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Alternar tema"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
