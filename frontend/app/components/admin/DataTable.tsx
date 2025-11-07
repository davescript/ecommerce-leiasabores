import { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Column<T> {
  key: string
  label: string
  render?: (item: T) => ReactNode
  sortable?: boolean
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  pagination?: {
    page: number
    limit: number
    total: number
    onPageChange: (page: number) => void
  }
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  emptyMessage?: string
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pagination,
  onSort,
  emptyMessage = 'Nenhum item encontrado'
}: DataTableProps<T>) {
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
          <span className="ml-3 text-gray-600">Carregando...</span>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && onSort && (
                      <button
                        onClick={() => onSort(column.key, 'asc')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ↕
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render
                      ? column.render(item)
                      : item[column.key] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} resultados
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-700">
              Página {pagination.page} de {totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

