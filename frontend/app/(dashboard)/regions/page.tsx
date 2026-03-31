"use client"

import { useRegionalData } from "@/lib/hooks/useRegionalData"

export default function RegionsPage() {
  const { data: regionalData, loading: regionalLoading } = useRegionalData()

  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Regional Analysis</h1>
        <p className="text-muted-foreground">Geographic health data and regional insights</p>
      </div>
      {regionalLoading ? (
        <p className="text-sm text-muted-foreground">Synchronizing regional data...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regionalData?.groups.map((group, idx) => (
            <div key={idx} className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
              <p className="text-sm text-muted-foreground mb-4 uppercase font-bold tracking-widest">{group.phc}</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <span className="text-xs text-muted-foreground">Population</span>
                   <span className="text-xs font-bold">{group.population.toLocaleString()}</span>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1 uppercase font-bold">Avg Risk Score</p>
                  <div className="w-full bg-muted rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full" style={{ width: `${group.avg_risk_score}%` }} /></div>
                  <p className="text-lg font-bold text-foreground mt-1">{group.avg_risk_score}%</p>
                </div>
                <div className="grid grid-cols-3 gap-1">
                   <div className="h-1 bg-risk-critical rounded-full" style={{ opacity: group.risk_distribution.red / 100 }} />
                   <div className="h-1 bg-risk-warning rounded-full" style={{ opacity: group.risk_distribution.yellow / 100 }} />
                   <div className="h-1 bg-risk-stable rounded-full" style={{ opacity: group.risk_distribution.green / 100 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
