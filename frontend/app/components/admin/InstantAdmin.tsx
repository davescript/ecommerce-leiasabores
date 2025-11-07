import { useState } from 'react'
import { Package, Plus, Search, Eye, EyeOff, Edit, Trash2, Home, ShoppingCart, Users, Settings, Folder, Ticket } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

// Componente admin que carrega instantaneamente (sem API calls)
export function InstantAdmin() {
  const [search, setSearch] = useState('')
  const location = useLocation()

  const navItems = [
    { name: 'Dashboard', icon: Home, path: '/admin' },
    { name: 'Produtos', icon: Package, path: '/admin/products' },
    { name: 'Pedidos', icon: ShoppingCart, path: '/admin/orders' },
    { name: 'Categorias', icon: Folder, path: '/admin/categories' },
    { name: 'Cupons', icon: Ticket, path: '/admin/coupons' },
    { name: 'Clientes', icon: Users, path: '/admin/customers' },
    { name: 'Configurações', icon: Settings, path: '/admin/settings' },
  ]

  const mockProducts = [
    { id: '1', name: 'Topo Personalizado Estrela', price: 17.99, inStock: true },
    { id: '2', name: 'Topo Clássico Azul', price: 12.99, inStock: true },
    { id: '3', name: 'Topo Clássico Dourado', price: 14.99, inStock: false },
  ]

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-br from-pink-500 to-orange-400 text-white shadow-lg">
        <div className="p-6 border-b border-pink-400/50">
          <h1 className="text-2xl font-bold">Leia Sabores</h1>
          <p className="text-sm text-pink-100">Painel Admin</p>
        </div>
        <nav className="mt-8 px-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 py-3 px-3 rounded-lg mb-2 transition-all ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-md' 
                    : 'text-pink-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {location.pathname === '/admin/products' ? 'Produtos' : 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Olá, Admin!</span>
            <button className="text-sm text-gray-500 hover:text-gray-700">Sair</button>
          </div>
        </header>

        <main className="p-6">
          {location.pathname === '/admin/products' ? (
            // Página de produtos instantânea
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Produtos</h3>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{mockProducts.length}</span>
                      <span className="text-gray-500">produtos</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{mockProducts.filter(p => p.inStock).length}</span>
                      <span className="text-gray-500">ativos</span>
                    </span>
                  </div>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Produto
                </button>
              </div>

              <div className="bg-white rounded-lg border p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg border overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {mockProducts
                    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
                    .map((product) => (
                    <div key={product.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-500">€{product.price.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {product.inStock ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Eye className="w-3 h-3 mr-1" />
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inativo
                          </span>
                        )}
                        
                        <div className="flex gap-1">
                          <button className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Dashboard instantâneo
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Dashboard</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-100">
                      <ShoppingCart className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Vendas Totais</p>
                      <p className="text-2xl font-bold text-gray-900">€45.97</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-100">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Produtos</p>
                      <p className="text-2xl font-bold text-gray-900">{mockProducts.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-purple-100">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Clientes</p>
                      <p className="text-2xl font-bold text-gray-900">12</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-orange-100">
                      <Ticket className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pedidos</p>
                      <p className="text-2xl font-bold text-gray-900">8</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-700">Novo produto criado: Topo Personalizado</span>
                    <span className="text-xs text-gray-500 ml-auto">há 2 min</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">Novo pedido recebido: #1234</span>
                    <span className="text-xs text-gray-500 ml-auto">há 5 min</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
