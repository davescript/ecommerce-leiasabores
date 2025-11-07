import { useState } from 'react'
import { Button } from '../../../components/Button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { toast } from 'sonner'
import { Save, Store, Mail, MapPin, CreditCard, Cloud, Globe } from 'lucide-react'

export function Settings() {
  const [shopName, setShopName] = useState('Leia Sabores')
  const [supportEmail, setSupportEmail] = useState('suporte@leiasabores.pt')
  const [address, setAddress] = useState('Rua Exemplo, 123, Cidade, País')
  const [stripeLiveKey, setStripeLiveKey] = useState('sk_live_...')
  const [stripeTestKey, setStripeTestKey] = useState('sk_test_...')
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState('whsec_...')
  const [r2Bucket, setR2Bucket] = useState('leiasabores-r2')
  const [r2AccessKey, setR2AccessKey] = useState('...')
  const [r2Endpoint, setR2Endpoint] = useState('https://...')

  const handleSave = () => {
    // TODO: Implementar lógica de salvar configurações no backend
    toast.success('Configurações salvas com sucesso!')
    console.log('Saving settings:', {
      shopName,
      supportEmail,
      address,
      stripeLiveKey,
      stripeTestKey,
      stripeWebhookSecret,
      r2Bucket,
      r2AccessKey,
      r2Endpoint,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerencie as configurações da sua loja</p>
      </div>

      {/* Store Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Informações da Loja</h2>
            <p className="text-sm text-gray-500">Configure as informações básicas da sua loja</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Loja
            </label>
            <Input 
              id="shopName" 
              value={shopName} 
              onChange={(e) => setShopName(e.target.value)}
              placeholder="Leia Sabores"
            />
          </div>
          <div>
            <label htmlFor="supportEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Email de Suporte
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                id="supportEmail" 
                type="email" 
                value={supportEmail} 
                onChange={(e) => setSupportEmail(e.target.value)}
                className="pl-10"
                placeholder="suporte@leiasabores.pt"
              />
            </div>
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Endereço
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Textarea 
                id="address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                rows={3}
                className="pl-10"
                placeholder="Rua, Número, Cidade, País"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Integration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Integração Stripe</h2>
            <p className="text-sm text-gray-500">Configure suas chaves de API do Stripe</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="stripeLiveKey" className="block text-sm font-medium text-gray-700 mb-2">
              Stripe Live Secret Key
            </label>
            <Input 
              id="stripeLiveKey" 
              type="password" 
              value={stripeLiveKey} 
              onChange={(e) => setStripeLiveKey(e.target.value)}
              placeholder="sk_live_..."
            />
          </div>
          <div>
            <label htmlFor="stripeTestKey" className="block text-sm font-medium text-gray-700 mb-2">
              Stripe Test Secret Key
            </label>
            <Input 
              id="stripeTestKey" 
              type="password" 
              value={stripeTestKey} 
              onChange={(e) => setStripeTestKey(e.target.value)}
              placeholder="sk_test_..."
            />
          </div>
          <div>
            <label htmlFor="stripeWebhookSecret" className="block text-sm font-medium text-gray-700 mb-2">
              Stripe Webhook Secret
            </label>
            <Input 
              id="stripeWebhookSecret" 
              type="password" 
              value={stripeWebhookSecret} 
              onChange={(e) => setStripeWebhookSecret(e.target.value)}
              placeholder="whsec_..."
            />
          </div>
        </div>
      </div>

      {/* Cloudflare R2 Integration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Cloud className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Integração Cloudflare R2</h2>
            <p className="text-sm text-gray-500">Configure o armazenamento de imagens</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="r2Bucket" className="block text-sm font-medium text-gray-700 mb-2">
              R2 Bucket Name
            </label>
            <Input 
              id="r2Bucket" 
              value={r2Bucket} 
              onChange={(e) => setR2Bucket(e.target.value)}
              placeholder="leiasabores-r2"
            />
          </div>
          <div>
            <label htmlFor="r2AccessKey" className="block text-sm font-medium text-gray-700 mb-2">
              R2 Access Key ID
            </label>
            <Input 
              id="r2AccessKey" 
              type="password" 
              value={r2AccessKey} 
              onChange={(e) => setR2AccessKey(e.target.value)}
              placeholder="..."
            />
          </div>
          <div>
            <label htmlFor="r2Endpoint" className="block text-sm font-medium text-gray-700 mb-2">
              R2 Endpoint
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                id="r2Endpoint" 
                value={r2Endpoint} 
                onChange={(e) => setR2Endpoint(e.target.value)}
                className="pl-10"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="px-8">
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  )
}
