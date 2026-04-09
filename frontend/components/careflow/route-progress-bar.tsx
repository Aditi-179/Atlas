"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { Activity } from "lucide-react"

/**
 * RouteProgressBar
 * A zero-dependency animated top progress bar + subtle page skeleton
 * that fires on every Next.js route change (including lazy-compiled pages).
 */
export function RouteProgressBar() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fadeRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevPathRef = useRef(pathname)

  const clearTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (fadeRef.current) clearTimeout(fadeRef.current)
  }

  const startProgress = () => {
    clearTimers()
    setProgress(0)
    setVisible(true)
    setLoading(true)

    // Crawl from 0 → 85% quickly, then slow down (realistic feel)
    let current = 0
    timerRef.current = setInterval(() => {
      current += current < 50 ? 8 : current < 70 ? 4 : current < 82 ? 1.5 : 0.3
      if (current >= 85) {
        clearInterval(timerRef.current!)
      }
      setProgress(Math.min(current, 85))
    }, 60)
  }

  const finishProgress = () => {
    clearTimers()
    setProgress(100)
    setLoading(false)
    // Fade out after the bar reaches 100%
    fadeRef.current = setTimeout(() => setVisible(false), 400)
  }

  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      prevPathRef.current = pathname
      startProgress()
    }
    // When the new page renders (pathname settled), finish
    const finish = setTimeout(() => finishProgress(), 120)
    return () => clearTimeout(finish)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => () => clearTimers(), [])

  if (!visible) return null

  return (
    <>
      {/* Top shimmer progress bar */}
      <div
        className="fixed top-0 left-0 right-0 z-[9999] h-[2.5px] pointer-events-none"
        style={{ background: "oklch(0.13 0.025 255 / 0.08)" }}
      >
        <div
          className="h-full transition-all ease-out"
          style={{
            width: `${progress}%`,
            background:
              "linear-gradient(90deg, oklch(0.56 0.13 186), oklch(0.65 0.18 186), oklch(0.56 0.13 186))",
            backgroundSize: "200% 100%",
            animation: loading ? "progress-shimmer 1.2s linear infinite" : "none",
            boxShadow: "0 0 10px oklch(0.56 0.13 186 / 0.7), 0 0 4px oklch(0.56 0.13 186 / 0.5)",
            transitionDuration: loading ? "200ms" : "300ms",
            opacity: visible ? 1 : 0,
          }}
        />
        {/* Glowing leading edge dot */}
        {loading && progress > 2 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
            style={{
              left: `calc(${progress}% - 6px)`,
              background: "oklch(0.65 0.18 186)",
              boxShadow: "0 0 12px 4px oklch(0.56 0.13 186 / 0.8)",
            }}
          />
        )}
      </div>

      {/* Subtle full-page overlay with loading label — only on slow loads */}
      {loading && progress < 60 && (
        <div className="fixed inset-0 z-[9998] pointer-events-none flex items-start justify-end px-6 pt-16">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-medium"
            style={{
              background: "oklch(0.17 0.025 255 / 0.85)",
              border: "1px solid oklch(0.25 0.025 255 / 0.6)",
              backdropFilter: "blur(12px)",
              color: "oklch(0.56 0.13 186)",
            }}
          >
            <Activity className="w-3 h-3 animate-pulse" />
            Loading…
          </div>
        </div>
      )}
    </>
  )
}
