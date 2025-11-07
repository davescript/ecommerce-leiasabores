import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Copy } from 'lucide-react'
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
  maxUses?: number
  usedCount: number
  validFrom: string
  validUntil: string
  active: boolean
}

async function fetchCoupons() {
  const response = await api.get<{ data: Coupon[] }>('/admin/coupons')
  return response.data
}

async function deleteCoupon(id: string) {
  const response = await api.delete(`/admin/coupons/${id}`)
  return response.data
}

export function CouponsList() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: fetchCoupons,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('Cupom deletado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao deletar cupom')
    },
  })

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este cupom?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleCopyCode = (code: string) => {
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

  const coupons = data?.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cupons</h1>
          <p className="text-gray-600 mt-1">Gerencie descontos e cupons</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cupom
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={[
          {
            key: 'code',
            label: 'Código',
            render: (coupon: Coupon) => (
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-gray-900">{coupon.code}</span>
                <button
                  onClick={() => handleCopyCode(coupon.code)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Copiar código"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            ),
          },
          {
            key: 'type',
            label: 'Tipo',
            render: (coupon: Coupon) => (
              <div>
                <div className="font-medium text-gray-900">{formatValue(coupon)}</div>
                <div className="text-xs text-gray-500 capitalize">{coupon.type}</div>
              </div>
            ),
          },
          {
            key: 'usage',
            label: 'Uso',
            render: (coupon: Coupon) => (
              <div className="text-sm text-gray-600">
                {coupon.usedCount} / {coupon.maxUses || '∞'}
              </div>
            ),
          },
          {
            key: 'validUntil',
            label: 'Válido até',
            render: (coupon: Coupon) => (
              <div className="text-sm text-gray-600">
                {new Date(coupon.validUntil).toLocaleDateString('pt-PT')}
              </div>
            ),
          },
          {
            key: 'active',
            label: 'Status',
            render: (coupon: Coupon) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  coupon.active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {coupon.active ? 'Ativo' : 'Inativo'}
              </span>
            ),
          },
          {
            key: 'actions',
            label: 'Ações',
            render: (coupon: Coupon) => (
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(coupon.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ),
          },
        ]}
        data={coupons}
        loading={isLoading}
        emptyMessage="Nenhum cupom encontrado"
      />
    </div>
  )
}

