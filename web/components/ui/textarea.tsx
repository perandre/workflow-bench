import { cn } from "@/lib/utils"
import { TextareaHTMLAttributes, forwardRef } from "react"

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5",
        "text-sm text-white placeholder:text-white/25 leading-relaxed",
        "transition-colors focus:outline-none focus:border-accent/50 focus:bg-accent/5 focus:ring-1 focus:ring-accent/30",
        "resize-none",
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = "Textarea"
