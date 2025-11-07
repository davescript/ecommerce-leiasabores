import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-PT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(typeof date === 'string' ? new Date(date) : date)
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}
