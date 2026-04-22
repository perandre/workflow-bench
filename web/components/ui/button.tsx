import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, forwardRef } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent disabled:opacity-40 disabled:cursor-not-allowed",
          variant === "default" && "bg-accent text-white hover:brightness-110 glow-accent glow-accent-hover",
          variant === "ghost" && "hover:bg-white/10 text-white/70 hover:text-white",
          variant === "outline" && "border border-white/18 hover:border-white/30 hover:bg-white/5 text-white/85 hover:text-white",
          size === "sm" && "h-9 px-3.5 text-sm gap-1.5",
          size === "md" && "h-10 px-4 text-sm gap-2",
          size === "lg" && "h-12 px-6 text-base gap-2.5",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
