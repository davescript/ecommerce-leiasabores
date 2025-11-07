import { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: {
    value: number
    isPositive: boolean
  }
  iconColor?: string
}

export function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  iconColor = 'text-primary'
}: KPICardProps) {
  const changeColorClass = change?.isPositive 
    ? 'text-green-600 bg-green-50' 
    : 'text-red-600 bg-red-50'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          iconColor === 'text-primary' && "bg-primary/10",
          iconColor === 'text-amber-600' && "bg-amber-50",
          iconColor === 'text-red-600' && "bg-red-50"
        )}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
      </div>
      
      {change && (
        <div className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
          changeColorClass
        )}>
          <span>{change.isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(change.value)}%</span>
          <span className="text-gray-500 ml-1">vs mês anterior</span>
        </div>
      )}
    </div>
  )
}
