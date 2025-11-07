// Página de teste para verificar se o AdminLayout funciona
import { AdminLayout } from '../../components/admin/AdminLayout'
import { Dashboard } from './Dashboard'

export function TestAdmin() {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-red-600">TESTE - Novo Painel Admin</h1>
        <p className="mt-4 text-gray-600">
          Se você está vendo esta página, o AdminLayout está funcionando!
        </p>
        <Dashboard />
      </div>
    </AdminLayout>
  )
}

