import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Copy, Tag, Calendar, Users } from 'lucide-react'
import { DataTable } from '../../../components/admin/DataTable'
import { Button } from '../../../components/Button'
import { api } from '../../../lib/api-client'
import { toast } from 'sonner'

interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed' | 'free_shipping'
  value: number
  minPurchase?: number
  expiresAt?: string
  maxUses?: number
  uses: number
  createdAt: string
}

export function CouponsList() {
  const qc = useQueryClient()

  const { data: coupons, isLoading } = useQuery<{ data: Coupon[]; total: number }>({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const response = await api.get('/admin/coupons')
      return response.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/admin/coupons/${id}`)
      return response.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('Cupom deletado com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao deletar cupom.')
    },
  })

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este cupom?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Código copiado!')
  }

  const formatValue = (coupon: Coupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.value}%`
    }
    if (coupon.type === 'free_shipping') {
      return 'Frete Grátis'
    }
    return `€${coupon.value.toFixed(2)}`
  }

  const columns = [
    { 
      key: 'code', 
      label: 'Código',
      render: (coupon: Coupon) => (
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" />
          <span className="font-mono font-semibold text-gray-900">{coupon.code}</span>
          <button
            onClick={() => handleCopy(coupon.code)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Copiar código"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      )
    },
    { 
      key: 'type', 
      label: 'Tipo',
      render: (coupon: Coupon) => (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
          {coupon.type === 'percentage' ? 'Percentual' : 
           coupon.type === 'fixed' ? 'Valor Fixo' : 
           'Frete Grátis'}
        </span>
      )
    },
    { 
      key: 'value', 
      label: 'Desconto',
      render: (coupon: Coupon) => (
        <span className="font-semibold text-gray-900">{formatValue(coupon)}</span>
      )
    },
    { 
      key: 'uses', 
      label: 'Usos',
      render: (coupon: Coupon) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{coupon.uses}</span>
          {coupon.maxUses && (
            <span className="text-sm text-gray-500">/ {coupon.maxUses}</span>
          )}
        </div>
      )
    },
    { 
      key: 'expiresAt', 
      label: 'Expira Em',
      render: (coupon: Coupon) => (
        coupon.expiresAt ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            {new Date(coupon.expiresAt).toLocaleDateString('pt-PT')}
          </div>
        ) : (
          <span className="text-sm text-gray-400">Nunca</span>
        )
      )
    },
    {
      key: 'actions',
      label: '',
      render: (coupon: Coupon) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // TODO: Implementar edição
              toast.info('Edição de cupom em breve')
            }}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(coupon.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Deletar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cupons</h1>
          <p className="text-gray-600 mt-1">Crie e gerencie cupons de desconto</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Novo Cupom
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={coupons?.data || []}
          loading={isLoading}
          emptyMessage="Nenhum cupom encontrado."
        />
      </div>
    </div>
  )
}
