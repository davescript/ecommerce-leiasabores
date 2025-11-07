import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Folder } from 'lucide-react'
import { DataTable } from '../../../components/admin/DataTable'
import { Button } from '../../../components/Button'
import { fetchCategories } from '../../../lib/api'
import { api } from '../../../lib/api-client'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  slug: string
  image?: string | null
  description?: string | null
  parentId?: string | null
  displayOrder?: number
}

async function deleteCategory(id: string) {
  const response = await api.delete(`/categories/${id}`)
  return response.data
}

export function CategoriesList() {
  const qc = useQueryClient()

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: fetchCategories,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      toast.success('Categoria deletada com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao deletar categoria.')
    },
  })

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta categoria?')) {
      deleteMutation.mutate(id)
    }
  }

  const columns = [
    {
      key: 'image',
      label: '',
      render: (category: Category) => (
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {category.image ? (
            <img 
              src={category.image} 
              alt={category.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64'
              }}
            />
          ) : (
            <Folder className="w-6 h-6 text-gray-400" />
          )}
        </div>
      ),
    },
    { 
      key: 'name', 
      label: 'Categoria',
      render: (category: Category) => (
        <div>
          <p className="font-semibold text-gray-900">{category.name}</p>
          {category.description && (
            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
          )}
        </div>
      )
    },
    { 
      key: 'slug', 
      label: 'Slug',
      render: (category: Category) => (
        <span className="font-mono text-sm text-gray-600">{category.slug}</span>
      )
    },
    {
      key: 'actions',
      label: '',
      render: (category: Category) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // TODO: Implementar edição
              toast.info('Edição de categoria em breve')
            }}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(category.id)}
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
          <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-600 mt-1">Organize seus produtos em categorias</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Nova Categoria
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={categories || []}
          loading={isLoading}
          emptyMessage="Nenhuma categoria encontrada."
        />
      </div>
    </div>
  )
}
