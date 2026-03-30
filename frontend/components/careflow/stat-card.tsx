"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  subtext?: string
  icon: LucideIcon
  trend?: "up" | "down" | "stable"
  trendLabel?: string
  colorClass?: string
  delay?: number
}

export function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  trendLabel,
  colorClass = "text-primary",
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className="animate-fade-in-up group relative bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative flex items-start justify-between mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.1em]">{label}</p>
        <div className={cn("p-2.5 rounded-xl bg-muted/50 group-hover:bg-muted transition-colors", colorClass)}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
      <div className="relative flex items-end justify-between">
        <div>
          <p className={cn("text-3xl font-bold tabular-nums tracking-tight", colorClass)}>{value}</p>
          {subtext && <p className="text-xs text-muted-foreground mt-1 font-medium">{subtext}</p>}
        </div>
        {trend && trendLabel && (
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
              trend === "up" && "bg-risk-critical/10 text-risk-critical",
              trend === "down" && "bg-risk-stable/10 text-risk-stable",
              trend === "stable" && "bg-muted text-muted-foreground"
            )}
          >
            {trend === "up" && <TrendingUp className="w-3.5 h-3.5" />}
            {trend === "down" && <TrendingDown className="w-3.5 h-3.5" />}
            {trend === "stable" && <Minus className="w-3.5 h-3.5" />}
            {trendLabel}
          </div>
        )}
      </div>
    </div>
  )
}
