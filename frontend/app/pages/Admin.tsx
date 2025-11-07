import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@components/Button'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import { setAuthToken } from '@lib/api-client'
import { fetchProducts, createProduct, updateProduct, deleteProduct, uploadFile } from '@lib/api'
import type { Product } from '@types'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export function Admin() {
  const qc = useQueryClient()
  const [token, setToken] = useState<string>(() => localStorage.getItem('admin_token') || '')
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<Partial<Product>>({
    name: '',
    description: '',
    shortDescription: '',
    price: 0,
    originalPrice: undefined,
    category: '',
    images: [],
    inStock: true,
    tags: [],
  })
  const [uploadPreview, setUploadPreview] = useState<string>('')

  useEffect(() => {
    setAuthToken(token || null)
    if (token) localStorage.setItem('admin_token', token)
    else localStorage.removeItem('admin_token')
  }, [token])

  const productsQuery = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => fetchProducts({ page: 1, limit: 50 }),
  })

  const createMutation = useMutation({
    mutationFn: (body: Partial<Product>) => createProduct(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); resetForm() },
  })
  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; body: Partial<Product> }) => updateProduct(payload.id, payload.body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); setEditing(null); resetForm() },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  })

  function resetForm() {
    setForm({ name: '', description: '', shortDescription: '', price: 0, category: '', images: [], inStock: true, tags: [] })
    setUploadPreview('')
  }

  async function handleUpload(file?: File) {
    if (!file) return
    
    // Validação de tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado. Use JPG, PNG, WebP ou SVG.')
      return
    }
    
    // Validação de tamanho (10MB máximo)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Tamanho máximo: 10MB.')
      return
    }
    
    try {
      const res = await uploadFile(file, 'products')
      const url = `/api/uploads/${res.key}`
      setUploadPreview(url)
      setForm(prev => ({ ...prev, images: [url] }))
      toast.success('Imagem carregada com sucesso')
    } catch (error) {
      toast.error('Erro ao fazer upload da imagem. Tente novamente.')
      // Log apenas em desenvolvimento
      if (import.meta.env.DEV) {
        console.error('Upload error:', error)
      }
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validação de preço
    const price = Number(form.price) || 0
    if (price < 0.01) {
      toast.error('O preço deve ser pelo menos €0.01')
      return
    }
    
    const body: Partial<Product> = {
      name: form.name?.trim() || '',
      description: form.description || '',
      shortDescription: form.shortDescription || '',
      price: price,
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      category: form.category || 'Diversos',
      images: form.images && form.images.length ? form.images : [],
      inStock: Boolean(form.inStock),
      tags: form.tags || [],
    }
    
    if (editing) {
      // Verificar se tem token configurado
      if (!token || token.trim() === '') {
        toast.error('Token JWT necessário! Configure o token na seção "Autenticação" acima.')
        return
      }
      
      updateMutation.mutate({ id: editing.id, body }, {
        onSuccess: () => {
          toast.success('Produto atualizado com sucesso!')
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.error || error?.message || 'Erro desconhecido'
          const status = error?.response?.status
          
          if (status === 401) {
            toast.error('Token inválido ou expirado. Configure um novo token JWT.')
          } else if (status === 403) {
            toast.error('Acesso negado. O token precisa ter role "admin".')
          } else {
            toast.error(`Erro ao atualizar produto: ${errorMessage}`)
          }
          
          console.error('Update error:', error)
        }
      })
    } else {
      // Verificar se tem token configurado
      if (!token || token.trim() === '') {
        toast.error('Token JWT necessário! Configure o token na seção "Autenticação" acima.')
        return
      }
      
      createMutation.mutate(body, {
        onSuccess: () => {
          toast.success('Produto criado com sucesso!')
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.error || error?.message || 'Erro desconhecido'
          const status = error?.response?.status
          
          if (status === 401) {
            toast.error('Token inválido ou expirado. Configure um novo token JWT.')
          } else if (status === 403) {
            toast.error('Acesso negado. O token precisa ter role "admin".')
          } else {
            toast.error(`Erro ao criar produto: ${errorMessage}`)
          }
          
          console.error('Create error:', error)
        }
      })
    }
  }

  function startEdit(p: Product) {
    setEditing(p)
    setForm({
      name: p.name,
      description: p.description,
      shortDescription: p.shortDescription,
      price: p.price,
      originalPrice: p.originalPrice,
      category: p.category,
      images: p.images,
      inStock: p.inStock,
      tags: p.tags,
    })
    setUploadPreview(p.images?.[0] || '')
  }

  return (
    <div className="min-h-screen bg-light py-10">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="text-3xl font-bold text-secondary mb-6">Admin — Leia Sabores</h1>

        <section className="mb-8 rounded-xl bg-white p-4 shadow-soft">
          <h2 className="text-lg font-semibold mb-3">Autenticação</h2>
          <div className="space-y-3">
            <div className="flex gap-3 items-center">
              <Input 
                value={token} 
                onChange={e => setToken(e.target.value)} 
                placeholder="JWT Token (admin)" 
                type="password"
                className="flex-1"
              />
              <Button onClick={() => {
                setAuthToken(token)
                toast.success('Token aplicado! Agora pode criar/editar produtos.')
              }}>
                Aplicar
              </Button>
              <Button 
                variant="outline"
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/admin/login?token=seed-topos-20251105`)
                    if (!response.ok) {
                      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
                      throw new Error(errorData.error || 'Erro ao gerar token')
                    }
                    const data = await response.json()
                    setToken(data.token)
                    setAuthToken(data.token)
                    toast.success('Token JWT gerado e aplicado automaticamente!')
                  } catch (error) {
                    toast.error('Erro ao gerar token. Verifique o console.')
                    console.error('Token generation error:', error)
                  }
                }}
              >
                Gerar Token
              </Button>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">
                O token é guardado localmente enquanto a sessão estiver aberta.
              </p>
              {!token && (
                <p className="text-xs text-amber-600">
                  ⚠️ Clique em "Gerar Token" para obter um token JWT válido automaticamente, ou configure manualmente.
                </p>
              )}
              {token && (
                <p className="text-xs text-green-600">
                  ✅ Token configurado. Você pode criar/editar produtos.
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 rounded-xl bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Produtos</h2>
              <Button variant="outline" onClick={() => { setEditing(null); resetForm() }}>Novo</Button>
            </div>
            {productsQuery.isLoading ? (
              <p className="text-gray-500">A carregar…</p>
            ) : (
              <div className="space-y-3">
                {(productsQuery.data?.data || []).map(p => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-md border p-3">
                    <img src={p.images?.[0]} alt={p.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-sm text-gray-500">{p.category} • €{p.price.toFixed(2)}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => startEdit(p)}>Editar</Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          if (window.confirm(`Tem certeza que deseja eliminar "${p.name}"? Esta ação não pode ser desfeita.`)) {
                            deleteMutation.mutate(p.id)
                          }
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl bg-white p-4 shadow-soft">
            <h2 className="text-lg font-semibold mb-3">{editing ? 'Editar' : 'Criar'} produto</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome" required />
              <Input 
                type="number" 
                step="0.01" 
                min="0.01"
                value={form.price || ''} 
                onChange={e => {
                  const inputValue = e.target.value
                  // Permitir string vazia temporariamente durante digitação
                  if (inputValue === '') {
                    setForm({ ...form, price: 0 })
                    return
                  }
                  const value = parseFloat(inputValue)
                  // Aceitar qualquer número válido (incluindo 0 para permitir digitação)
                  if (!isNaN(value) && value >= 0) {
                    setForm({ ...form, price: value })
                  }
                }} 
                onBlur={e => {
                  // Garantir valor mínimo ao sair do campo
                  const value = parseFloat(e.target.value) || 0
                  if (value < 0.01) {
                    setForm({ ...form, price: 0.01 })
                  }
                }}
                placeholder="Preço (ex: 1.00)" 
                required 
              />
              <Input value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Categoria" />
              <Textarea value={form.shortDescription || ''} onChange={e => setForm({ ...form, shortDescription: e.target.value })} placeholder="Descrição curta" />
              <Textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descrição" />

              <div className="space-y-2">
                <label className="text-sm font-medium">Imagem (upload para R2)</label>
                <input type="file" accept="image/*" onChange={e => handleUpload(e.target.files?.[0] || undefined)} />
                {uploadPreview && <img src={uploadPreview} alt="preview" className="w-full h-32 object-cover rounded" />}
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>{editing ? 'Guardar' : 'Criar'}</Button>
                <Button type="button" variant="ghost" onClick={() => { setEditing(null); resetForm() }}>Limpar</Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}
