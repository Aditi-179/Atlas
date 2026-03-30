"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { ResourceAllocationDashboard } from "@/components/careflow/population-health/resource-allocation-dashboard"
import { InterventionSimulator } from "@/components/careflow/population-health/intervention-simulator"
import { PopulationInsights } from "@/components/careflow/population-health/population-insights"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PopulationHealthPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <AppShell title="Population Health Analytics" subtitle="Predictive resource allocation and intervention planning">
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Resource Allocation</TabsTrigger>
            <TabsTrigger value="simulator">What-If Simulator</TabsTrigger>
            <TabsTrigger value="insights">Population Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <ResourceAllocationDashboard />
          </TabsContent>

          <TabsContent value="simulator" className="space-y-4">
            <InterventionSimulator />
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <PopulationInsights />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
