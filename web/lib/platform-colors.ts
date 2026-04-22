export const PLATFORM_COLORS: Record<string, string> = {
  inngest: "#8B5CF6",
  mastra: "#F97316",
  hatchet: "#10B981",
  restate: "#0EA5E9",
}

export const DEFAULT_ACCENT = "#6366F1"

export function platformColor(platform: string): string {
  return PLATFORM_COLORS[platform.toLowerCase()] ?? DEFAULT_ACCENT
}

export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, "0")
  return `${hex}${a}`
}
