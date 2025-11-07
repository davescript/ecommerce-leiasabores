import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
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
      toast.success('Categoria deletada com sucesso')
    },
    onError: () => {
      toast.error('Erro ao deletar categoria')
    },
  })

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta categoria?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-600 mt-1">Gerencie suas categorias</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={[
          {
            key: 'image',
            label: 'Imagem',
            render: (category: Category) => (
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                )}
              </div>
            ),
          },
          {
            key: 'name',
            label: 'Nome',
            render: (category: Category) => (
              <div>
                <div className="font-medium text-gray-900">{category.name}</div>
                <div className="text-sm text-gray-500">{category.slug}</div>
              </div>
            ),
          },
          {
            key: 'description',
            label: 'Descrição',
            render: (category: Category) => (
              <div className="text-sm text-gray-600 max-w-md truncate">
                {category.description || '-'}
              </div>
            ),
          },
          {
            key: 'displayOrder',
            label: 'Ordem',
            render: (category: Category) => (
              <div className="text-sm text-gray-600">{category.displayOrder}</div>
            ),
          },
          {
            key: 'actions',
            label: 'Ações',
            render: (category: Category) => (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // TODO: Implementar edição
                    console.log('Edit category:', category.id)
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ),
          },
        ]}
        data={categories || []}
        loading={isLoading}
        emptyMessage="Nenhuma categoria encontrada"
      />
    </div>
  )
}

