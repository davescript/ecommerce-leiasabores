import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@lib/utils'

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  asChild?: boolean
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, asChild, ...props }, ref) => {
  const Comp = asChild ? Slot : 'label'
  return (
    <Comp
      ref={ref}
      className={cn('text-sm font-semibold text-secondary', className)}
      {...props}
    />
  )
})
Label.displayName = 'Label'
