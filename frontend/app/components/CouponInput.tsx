import { useState } from 'react'
import { Ticket, X, CheckCircle } from 'lucide-react'
import { Button } from './Button'
import { Input } from './ui/input'
import { useCartStore } from '@hooks/useCart'
import { toast } from 'sonner'

export function CouponInput() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const { couponCode, couponDiscount, applyCoupon, removeCoupon } = useCartStore()

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error('Por favor, insira um código de cupom')
      return
    }

    if (couponCode) {
      toast.info('Já existe um cupom aplicado. Remova-o primeiro.')
      return
    }

    setLoading(true)
    try {
      const success = await applyCoupon(code.trim().toUpperCase())
      if (success) {
        toast.success('Cupom aplicado com sucesso!')
        setCode('')
      } else {
        toast.error('Cupom inválido ou expirado')
      }
    } catch (error) {
      toast.error('Erro ao aplicar cupom. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    removeCoupon()
    toast.success('Cupom removido')
  }

  if (couponCode) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:bg-green-900/20 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Cupom aplicado: {couponCode}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                Desconto de €{couponDiscount.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="rounded-lg p-1 hover:bg-green-100 dark:hover:bg-green-800/50"
          >
            <X className="h-4 w-4 text-green-600 dark:text-green-400" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:bg-gray-800 dark:border-gray-700">
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Código de cupom
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Ticket className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Digite o código"
            className="pl-10"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleApply()
              }
            }}
          />
        </div>
        <Button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="whitespace-nowrap"
        >
          {loading ? 'Aplicando...' : 'Aplicar'}
        </Button>
      </div>
    </div>
  )
}

