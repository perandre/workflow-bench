import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "success" | "error" | "warning" | "running" | "pending"

export function Badge({ children, variant = "default", className }: {
  children: React.ReactNode; variant?: BadgeVariant; className?: string
}) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-tight",
      variant === "default" && "bg-white/10 text-white/80",
      variant === "success" && "bg-success/15 text-success",
      variant === "error" && "bg-danger/15 text-danger",
      variant === "warning" && "bg-warning/15 text-warning",
      variant === "running" && "bg-running/15 text-running",
      variant === "pending" && "bg-white/8 text-white/55",
      className
    )}>
      {variant === "running" && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-running animate-pulse" />
      )}
      {children}
    </span>
  )
}
