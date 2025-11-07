import { ReactNode, useState } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  Settings, 
  FileText,
  BarChart3,
  Megaphone,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface NavItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  badge?: number
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Produtos', icon: Package, path: '/admin/products' },
  { label: 'Pedidos', icon: ShoppingCart, path: '/admin/orders' },
  { label: 'Clientes', icon: Users, path: '/admin/customers' },
  { label: 'Categorias', icon: FileText, path: '/admin/categories' },
  { label: 'Cupons', icon: Tag, path: '/admin/coupons' },
  { label: 'Marketing', icon: Megaphone, path: '/admin/marketing' },
  { label: 'Conteúdo', icon: FileText, path: '/admin/content' },
  { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  { label: 'Configurações', icon: Settings, path: '/admin/settings' },
]

export function AdminLayout({ children }: { children?: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { logout } = useAuth()

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
              <span>Admin</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">
                {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-600">
              <Search className="w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-transparent border-none outline-none text-sm w-48"
              />
            </div>
            
            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            
            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                A
              </div>
              <button
                onClick={logout}
                className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50 pt-16 lg:pt-0
            w-64 bg-white border-r border-gray-200
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            lg:translate-x-0 h-screen overflow-y-auto
          `}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200 hidden lg:block">
              <Link to="/admin" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">LS</span>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Leia Sabores</h2>
                  <p className="text-xs text-gray-500">Painel Administrativo</p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-200
                      ${active
                        ? 'bg-gradient-to-r from-primary to-primary/90 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                        active 
                          ? 'bg-white/20 text-white' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Footer - Mobile Only */}
            <div className="lg:hidden p-4 border-t border-gray-200">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="p-6 lg:p-8">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  )
}
