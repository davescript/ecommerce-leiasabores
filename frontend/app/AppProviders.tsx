import type { PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@lib/query-client'
import { Toaster } from 'sonner'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" toastOptions={{ duration: 4000 }} />
    </QueryClientProvider>
  )
}
