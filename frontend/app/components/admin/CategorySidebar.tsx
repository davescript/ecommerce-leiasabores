import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, ChevronDown, FolderTree } from 'lucide-react'
import { categoriesApi } from '@lib/admin-api'

interface Category {
  id: string
  name: string
  slug: string
  parentId: string | null
  children?: Category[]
}

export function CategorySidebar() {
  const [categories, setCategories] = useState<Category[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [searchParams] = useSearchParams()
  const selectedCategory = searchParams.get('category') || ''

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.list()
      const categoriesTree = response.data.categories || response.data.flat || []
      setCategories(categoriesTree)
      // Expand all categories by default
      const allIds = new Set<string>()
      const collectIds = (cats: Category[]) => {
        cats.forEach(cat => {
          allIds.add(cat.id)
          if (cat.children) collectIds(cat.children)
        })
      }
      collectIds(categoriesTree)
      setExpandedCategories(allIds)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const renderCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories.has(category.id)
    const isActive = selectedCategory === category.slug

    return (
      <div key={category.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          style={{ paddingLeft: `${12 + level * 20}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleCategory(category.id)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}
          <Link
            to={`/admin/products?category=${category.slug}`}
            className="flex items-center gap-2 flex-1"
          >
            <FolderTree size={16} />
            <span className="text-sm font-medium">{category.name}</span>
          </Link>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Categorias
      </div>
      {categories.map(category => renderCategory(category))}
    </div>
  )
}

