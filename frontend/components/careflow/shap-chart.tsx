"use client"

import { type Patient } from "@/lib/mock-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface ShapChartProps {
  patient: Patient
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { feature: string; value: number; rawValue: string } }[] }) => {
  if (!active || !payload?.[0]) return null
  const d = payload[0].payload
  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-xs max-w-52">
      <p className="font-semibold text-foreground mb-1">{d.feature}</p>
      <p className="text-muted-foreground">Raw value: <span className="text-foreground font-medium">{d.rawValue}</span></p>
      <p className={d.value > 0 ? "text-risk-critical mt-1" : "text-risk-stable mt-1"}>
        SHAP impact: {d.value > 0 ? "+" : ""}{d.value}%
      </p>
    </div>
  )
}

export function ShapChart({ patient }: ShapChartProps) {
  // Sort by absolute value descending
  const sorted = [...patient.shapFeatures].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Feature Importance (SHAP)</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Diverging chart — red bars increase risk, teal bars decrease risk
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-risk-critical" />
          <span className="text-[11px] text-muted-foreground">Risk-increasing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-primary" />
          <span className="text-[11px] text-muted-foreground">Risk-protective</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 0, right: 32, bottom: 0, left: 0 }}
          barSize={14}
        >
          <XAxis
            type="number"
            domain={[-30, 30]}
            tick={{ fontSize: 10, fill: "oklch(0.52 0.02 240)" }}
            tickLine={false}
            axisLine={{ stroke: "oklch(0.91 0.008 220)" }}
            tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}%`}
          />
          <YAxis
            type="category"
            dataKey="feature"
            width={130}
            tick={{ fontSize: 10, fill: "oklch(0.52 0.02 240)" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(0.97 0 0 / 0.5)" }} />
          <ReferenceLine x={0} stroke="oklch(0.91 0.008 220)" strokeWidth={1.5} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {sorted.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.value > 0
                    ? "oklch(0.628 0.258 27.325)"
                    : "oklch(0.56 0.13 186)"
                }
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
