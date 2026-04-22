import { cn } from "@/lib/utils"
import { TextareaHTMLAttributes, forwardRef } from "react"

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] w-full rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2.5",
        "text-sm text-white placeholder:text-white/40 leading-relaxed",
        "transition-colors focus:outline-none focus:border-accent/60 focus:bg-accent/5 focus:ring-2 focus:ring-accent/30",
        "resize-none",
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = "Textarea"
