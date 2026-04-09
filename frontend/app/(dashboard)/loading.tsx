import { Loader2, Activity } from "lucide-react"

/**
 * Next.js App Router instant loading UI.
 * Shown immediately while the route segment is compiling or fetching data.
 * Replaces the blank white "compiling…" flash.
 */
export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-6">
      {/* Animated icon cluster */}
      <div className="relative">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.56 0.13 186 / 0.15), oklch(0.56 0.13 186 / 0.05))",
            border: "1px solid oklch(0.56 0.13 186 / 0.25)",
          }}
        >
          <Activity
            className="w-6 h-6"
            style={{ color: "oklch(0.56 0.13 186)" }}
          />
        </div>
        {/* Spinning ring */}
        <div
          className="absolute inset-0 rounded-2xl border-2 border-transparent animate-spin"
          style={{
            borderTopColor: "oklch(0.56 0.13 186)",
            borderRightColor: "oklch(0.56 0.13 186 / 0.3)",
            animationDuration: "1s",
          }}
        />
      </div>

      {/* Skeleton content area */}
      <div className="w-full max-w-3xl space-y-4 px-4">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div
            className="h-5 w-48 rounded-lg animate-pulse"
            style={{ background: "oklch(0.91 0.008 220)" }}
          />
          <div
            className="h-3.5 w-72 rounded-lg animate-pulse"
            style={{ background: "oklch(0.91 0.008 220 / 0.6)" }}
          />
        </div>

        {/* Card skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl p-4 space-y-3 animate-pulse"
              style={{
                background: "oklch(0.96 0.005 220)",
                border: "1px solid oklch(0.91 0.008 220)",
                animationDelay: `${i * 100}ms`,
              }}
            >
              <div
                className="h-3 w-20 rounded"
                style={{ background: "oklch(0.88 0.008 220)" }}
              />
              <div
                className="h-7 w-16 rounded"
                style={{ background: "oklch(0.88 0.008 220)" }}
              />
              <div
                className="h-2 w-full rounded"
                style={{ background: "oklch(0.88 0.008 220)" }}
              />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div
          className="rounded-xl overflow-hidden animate-pulse"
          style={{
            border: "1px solid oklch(0.91 0.008 220)",
            animationDelay: "200ms",
          }}
        >
          <div
            className="h-10 w-full"
            style={{ background: "oklch(0.94 0.006 220)" }}
          />
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 border-t flex items-center px-4 gap-4"
              style={{
                borderColor: "oklch(0.91 0.008 220)",
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex-shrink-0"
                style={{ background: "oklch(0.91 0.008 220)" }}
              />
              <div className="flex-1 space-y-1.5">
                <div
                  className="h-2.5 w-32 rounded"
                  style={{ background: "oklch(0.91 0.008 220)" }}
                />
                <div
                  className="h-2 w-20 rounded"
                  style={{ background: "oklch(0.94 0.006 220)" }}
                />
              </div>
              <div
                className="h-5 w-16 rounded-full"
                style={{ background: "oklch(0.91 0.008 220)" }}
              />
            </div>
          ))}
        </div>
      </div>

      <p
        className="text-xs font-medium tracking-wide"
        style={{ color: "oklch(0.56 0.13 186)" }}
      >
        Loading…
      </p>
    </div>
  )
}
