import * as React from 'react'
import * as SheetPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@lib/utils'

const Sheet = SheetPrimitive.Root
const SheetClose = SheetPrimitive.Close
const SheetPortal = SheetPrimitive.Portal
const SheetOverlay = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>>(
  ({ className, ...props }, ref) => (
    <SheetPrimitive.Overlay
      ref={ref}
      className={cn('fixed inset-0 z-40 bg-black/50 backdrop-blur-sm', className)}
      {...props}
    />
  )
)
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const SheetContent = React.forwardRef<React.ElementRef<typeof SheetPrimitive.Content>, React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>>(
  ({ className, children, ...props }, ref) => (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto border-l border-gray-100 bg-white shadow-xl focus:outline-none',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <SheetPrimitive.Title className="text-lg font-semibold text-secondary">Carrinho</SheetPrimitive.Title>
          <SheetClose className="rounded-full p-1 text-secondary transition hover:bg-light" aria-label="Fechar">
            <X className="h-5 w-5" />
          </SheetClose>
        </div>
        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
)
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-6 pt-4 pb-2 text-left', className)} {...props} />
)
SheetHeader.displayName = 'SheetHeader'

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-auto px-6 pb-6 pt-2', className)} {...props} />
)
SheetFooter.displayName = 'SheetFooter'

const SheetTrigger = SheetPrimitive.Trigger
const SheetTitle = SheetPrimitive.Title
const SheetDescription = SheetPrimitive.Description

export { Sheet, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription, SheetTrigger }
