import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@components/Button'
import { Input } from '@components/ui/input'
import { Textarea } from '@components/ui/textarea'
import { setAuthToken } from '@lib/api-client'
import { fetchProducts, createProduct, updateProduct, deleteProduct, uploadFile } from '@lib/api'
import type { Product } from '@types'
import { motion } from 'framer-motion'

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
    const res = await uploadFile(file, 'products')
    const url = `/api/uploads/${res.key}`
    setUploadPreview(url)
    setForm(prev => ({ ...prev, images: [url] }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body: Partial<Product> = {
      name: form.name?.trim() || '',
      description: form.description || '',
      shortDescription: form.shortDescription || '',
      price: Number(form.price) || 0,
      originalPrice: form.originalPrice,
      category: form.category || 'Diversos',
      images: form.images && form.images.length ? form.images : [],
      inStock: Boolean(form.inStock),
      tags: form.tags || [],
    }
    if (editing) updateMutation.mutate({ id: editing.id, body })
    else createMutation.mutate(body)
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
          <div className="flex gap-3 items-center">
            <Input value={token} onChange={e => setToken(e.target.value)} placeholder="JWT Token (admin)" />
            <Button onClick={() => setAuthToken(token)}>Aplicar</Button>
            <span className="text-xs text-gray-500">O token é guardado localmente enquanto a sessão estiver aberta.</span>
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
                      <Button variant="ghost" onClick={() => deleteMutation.mutate(p.id)}>Eliminar</Button>
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
              <Input type="number" step="0.01" value={form.price as number} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) })} placeholder="Preço" required />
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
