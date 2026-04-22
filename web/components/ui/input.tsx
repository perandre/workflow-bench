import { cn } from "@/lib/utils"
import { InputHTMLAttributes, forwardRef } from "react"

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2",
        "text-sm text-white placeholder:text-white/25",
        "transition-colors focus:outline-none focus:border-accent/50 focus:bg-accent/5 focus:ring-1 focus:ring-accent/30",
        className
      )}
      {...props}
    />
  )
)
Input.displayName = "Input"
