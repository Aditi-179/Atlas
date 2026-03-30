"use client"

import { useState, useCallback } from "react"
import { LandingPage } from "@/components/careflow/landing-page"
import { AppSidebar } from "@/components/careflow/app-sidebar"
import { MacroRadar } from "@/components/careflow/macro-radar"
import { PatientDeepDive } from "@/components/careflow/patient-deep-dive"
import { CopilotSidebar } from "@/components/careflow/copilot-sidebar"
import { type Patient } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Brain, ArrowLeft } from "lucide-react"
import { usePopulationData } from "@/lib/hooks/usePopulationData"
import { useRegionalData } from "@/lib/hooks/useRegionalData"

type Role = "NGO Admin" | "Field Worker"

export default function CareFlowApp() {
  const [showDashboard, setShowDashboard] = useState(false)
  const [activeView, setActiveView] = useState("dashboard")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [copilotOpen, setCopilotOpen] = useState(true)
  const [pendingCopilotMessage, setPendingCopilotMessage] = useState<string | undefined>(undefined)
  const [role, setRole] = useState<Role>("NGO Admin")
  const { stats, loading: statsLoading } = usePopulationData()
  const { data: regionalData, loading: regionalLoading } = useRegionalData()

  const handleSelectPatient = useCallback((patient: Patient) => {
    setSelectedPatient(patient)
  }, [])

  const handleBack = useCallback(() => {
    setSelectedPatient(null)
  }, [])

  const handleAskCopilot = useCallback((question: string) => {
    setPendingCopilotMessage(question)
    setCopilotOpen(true)
  }, [])

  const handlePendingConsumed = useCallback(() => {
    setPendingCopilotMessage(undefined)
  }, [])

  const handleEnterDashboard = useCallback(() => {
    setShowDashboard(true)
  }, [])

  const handleBackToLanding = useCallback(() => {
    setShowDashboard(false)
    setSelectedPatient(null)
  }, [])

  const handleRoleChange = useCallback((newRole: Role) => {
    setRole(newRole)
  }, [])

  // Show landing page first
  if (!showDashboard) {
    return <LandingPage onEnterDashboard={handleEnterDashboard} />
  }

  const isDeepDive = selectedPatient !== null

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Sidebar */}
      <AppSidebar 
        activeView={activeView} 
        onViewChange={setActiveView}
        role={role}
        onRoleChange={handleRoleChange}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleBackToLanding}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Button>
            <span className="text-border">/</span>
            <span className="font-medium text-foreground text-sm">
              {isDeepDive ? "Patient Deep-Dive" : 
               activeView === "dashboard" ? "Macro-Radar" :
               activeView === "population" ? "Population" :
               activeView === "vitals" ? "Vitals Monitor" :
               activeView === "regions" ? "Regions" :
               activeView === "settings" ? "Settings" : "Macro-Radar"}
            </span>
            {isDeepDive && selectedPatient && (
              <>
                <span className="text-border">/</span>
                <span className="text-primary font-medium text-sm">{selectedPatient.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Copilot toggle */}
            <Button
              variant={copilotOpen ? "default" : "outline"}
              size="sm"
              className={
                copilotOpen
                  ? "h-8 gap-2 text-xs bg-primary text-primary-foreground"
                  : "h-8 gap-2 text-xs"
              }
              onClick={() => setCopilotOpen((o) => !o)}
            >
              <Brain className="w-3.5 h-3.5" />
              Clinical Copilot
              {!copilotOpen && (
                <span className="w-1.5 h-1.5 rounded-full bg-risk-stable" />
              )}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="px-6 py-5">
          {isDeepDive && selectedPatient ? (
            <PatientDeepDive
              patient={selectedPatient}
              onBack={handleBack}
              onAskCopilot={handleAskCopilot}
            />
          ) : activeView === "dashboard" ? (
            <MacroRadar
              selectedPatientId={selectedPatient !== null ? (selectedPatient as { id: string }).id : null}
              onSelectPatient={handleSelectPatient}
            />
          ) : activeView === "population" ? (
            <div className="animate-fade-in-up space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">Population Overview</h1>
                <p className="text-muted-foreground">Comprehensive population health analytics and demographics</p>
              </div>
              {statsLoading ? (
                <p className="text-sm text-muted-foreground">Loading population data…</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                    <p className="text-sm text-muted-foreground mb-2">Total Screened</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.totalScreened.toLocaleString() ?? "—"}</p>
                    <p className="text-xs text-muted-foreground mt-2">Active participants</p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                    <p className="text-sm text-muted-foreground mb-2">Average Age</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.averageAge ?? "—"}</p>
                    <p className="text-xs text-muted-foreground mt-2">years</p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                    <p className="text-sm text-muted-foreground mb-2">Gender Split</p>
                    <p className="text-3xl font-bold text-foreground">
                      {stats ? `${stats.femaleCount}F / ${stats.maleCount}M` : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">Female / Male</p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
                    <p className="text-sm text-muted-foreground mb-2">High NCD Risk</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.highRiskCount.toLocaleString() ?? "—"}</p>
                    <p className="text-xs text-muted-foreground mt-2">patients flagged</p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
                    <p className="text-sm text-muted-foreground mb-2">Avg NCD Risk Score</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.averageNcdRisk ?? "—"}</p>
                    <p className="text-xs text-muted-foreground mt-2">out of 100</p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
                    <p className="text-sm text-muted-foreground mb-2">Normal Vitals</p>
                    <p className="text-3xl font-bold text-foreground">{stats?.normalVitalsCount.toLocaleString() ?? "—"}</p>
                    <p className="text-xs text-muted-foreground mt-2">no risk flags</p>
                  </div>
                </div>
              )}
            </div>
          ) : activeView === "vitals" ? (
            <div className="animate-fade-in-up space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">Vitals Monitor</h1>
                <p className="text-muted-foreground">Real-time patient vitals monitoring and trends</p>
              </div>
              {statsLoading ? (
                <p className="text-sm text-muted-foreground">Loading vitals data…</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                    <p className="text-sm text-muted-foreground mb-2">Blood Pressure (High)</p>
                    <p className="text-3xl font-bold text-risk-critical">{stats?.highBPCount.toLocaleString() ?? "—"}</p>
                    <p className="text-xs text-muted-foreground mt-2">patients</p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                    <p className="text-sm text-muted-foreground mb-2">High Cholesterol</p>
                    <p className="text-3xl font-bold text-risk-warning">{stats?.highCholCount.toLocaleString() ?? "—"}</p>
                    <p className="text-xs text-muted-foreground mt-2">patients</p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                    <p className="text-sm text-muted-foreground mb-2">BMI (Obese)</p>
                    <p className="text-3xl font-bold text-primary">{stats?.obeseCount.toLocaleString() ?? "—"}</p>
                    <p className="text-xs text-muted-foreground mt-2">patients (BMI ≥ 30)</p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
                    <p className="text-sm text-muted-foreground mb-2">Normal Vitals</p>
                    <p className="text-3xl font-bold text-risk-stable">{stats?.normalVitalsCount.toLocaleString() ?? "—"}</p>
                    <p className="text-xs text-muted-foreground mt-2">patients</p>
                  </div>
                </div>
              )}
            </div>
          ) : activeView === "regions" ? (
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
          ) : activeView === "settings" ? (
            <div className="animate-fade-in-up space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">Settings</h1>
                <p className="text-muted-foreground">System configuration and user preferences</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                  <h3 className="font-semibold text-foreground mb-4">User Account</h3>
                  <div className="space-y-3 text-sm">
                    <div><p className="text-muted-foreground">Name: Dr. Ada Mensah</p></div>
                    <div><p className="text-muted-foreground">Role: {role}</p></div>
                    <div><p className="text-muted-foreground">Organization: Ministry of Health</p></div>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                  <h3 className="font-semibold text-foreground mb-4">Preferences</h3>
                  <div className="space-y-3 text-sm">
                    <div><p className="text-muted-foreground">Theme: Dark Mode</p></div>
                    <div><p className="text-muted-foreground">Notifications: Enabled</p></div>
                    <div><p className="text-muted-foreground">Data Export: Monthly</p></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <MacroRadar
              selectedPatientId={selectedPatient ? (selectedPatient as any).id : null}
              onSelectPatient={handleSelectPatient}
            />
          )}
        </div>
      </main>

      {/* Right Copilot Sidebar */}
      <CopilotSidebar
        patient={selectedPatient}
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        pendingMessage={pendingCopilotMessage}
        onPendingMessageConsumed={handlePendingConsumed}
      />
    </div>
  )
}
