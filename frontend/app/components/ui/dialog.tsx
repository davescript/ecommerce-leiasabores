import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn('fixed inset-0 z-40 bg-black/30 backdrop-blur-sm', className)}
      {...props}
    />
  )
)
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>>(
  ({ className, children, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 m-auto flex h-fit max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/30 bg-white/95 p-6 shadow-soft-lg backdrop-blur-xl focus:outline-none',
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 text-secondary transition hover:bg-light" aria-label="Fechar">
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-left', className)} {...props} />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Title ref={ref} className={cn('text-xl font-semibold leading-none tracking-tight text-secondary', className)} {...props} />
  )
)
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Description ref={ref} className={cn('text-sm text-gray-600', className)} {...props} />
  )
)
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogOverlay,
}
