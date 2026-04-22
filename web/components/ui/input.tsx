import { cn } from "@/lib/utils"
import { InputHTMLAttributes, forwardRef } from "react"

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2",
        "text-sm text-white placeholder:text-white/40",
        "transition-colors focus:outline-none focus:border-accent/60 focus:bg-accent/5 focus:ring-2 focus:ring-accent/30",
        className
      )}
      {...props}
    />
  )
)
Input.displayName = "Input"
