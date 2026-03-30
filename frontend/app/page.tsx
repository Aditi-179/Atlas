"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { LandingPage } from "@/components/careflow/landing-page"
import { AppSidebar } from "@/components/careflow/app-sidebar"
import { MacroRadar } from "@/components/careflow/macro-radar"
import { PatientDeepDive } from "@/components/careflow/patient-deep-dive"
import { CopilotSidebar } from "@/components/careflow/copilot-sidebar"
import { type Patient } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Brain, ArrowLeft } from "lucide-react"

type Role = "NGO Admin" | "Field Worker"

export default function CareFlowApp() {
  const router = useRouter()
  const [showDashboard, setShowDashboard] = useState(false)
  const [activeView, setActiveView] = useState("dashboard")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [copilotOpen, setCopilotOpen] = useState(true)
  const [pendingCopilotMessage, setPendingCopilotMessage] = useState<string | undefined>(undefined)
  const [role, setRole] = useState<Role>("NGO Admin")

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
    router.push("/signup")
  }, [router])

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
              selectedPatientId={selectedPatient?.id ?? null}
              onSelectPatient={handleSelectPatient}
            />
          ) : activeView === "population" ? (
            <div className="animate-fade-in-up space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">Population Overview</h1>
                <p className="text-muted-foreground">Comprehensive population health analytics and demographics</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                  <p className="text-sm text-muted-foreground mb-2">Total Enrolled</p>
                  <p className="text-3xl font-bold text-foreground">12,847</p>
                  <p className="text-xs text-muted-foreground mt-2">Active participants</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                  <p className="text-sm text-muted-foreground mb-2">Average Age</p>
                  <p className="text-3xl font-bold text-foreground">42.3</p>
                  <p className="text-xs text-muted-foreground mt-2">years</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                  <p className="text-sm text-muted-foreground mb-2">Gender Distribution</p>
                  <p className="text-3xl font-bold text-foreground">52/48</p>
                  <p className="text-xs text-muted-foreground mt-2">F/M ratio</p>
                </div>
              </div>
            </div>
          ) : activeView === "vitals" ? (
            <div className="animate-fade-in-up space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">Vitals Monitor</h1>
                <p className="text-muted-foreground">Real-time patient vitals monitoring and trends</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                  <p className="text-sm text-muted-foreground mb-2">Blood Pressure (High)</p>
                  <p className="text-3xl font-bold text-risk-critical">847</p>
                  <p className="text-xs text-muted-foreground mt-2">patients</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                  <p className="text-sm text-muted-foreground mb-2">Blood Sugar (Abnormal)</p>
                  <p className="text-3xl font-bold text-risk-warning">623</p>
                  <p className="text-xs text-muted-foreground mt-2">patients</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
                  <p className="text-sm text-muted-foreground mb-2">BMI (Overweight)</p>
                  <p className="text-3xl font-bold text-primary">2,156</p>
                  <p className="text-xs text-muted-foreground mt-2">patients</p>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
                  <p className="text-sm text-muted-foreground mb-2">Normal Vitals</p>
                  <p className="text-3xl font-bold text-risk-stable">9,221</p>
                  <p className="text-xs text-muted-foreground mt-2">patients</p>
                </div>
              </div>
            </div>
          ) : activeView === "regions" ? (
            <div className="animate-fade-in-up space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">Regional Analysis</h1>
                <p className="text-muted-foreground">Geographic health data and regional insights</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                  <p className="text-sm text-muted-foreground mb-4">Dakar Region</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">High-Risk Coverage</p>
                      <div className="w-full bg-muted rounded-full h-2"><div className="bg-primary h-2 rounded-full w-3/4" /></div>
                    </div>
                    <p className="text-lg font-bold text-foreground">75% of population</p>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                  <p className="text-sm text-muted-foreground mb-4">Health Worker Density</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Active Deployment</p>
                      <div className="w-full bg-muted rounded-full h-2"><div className="bg-risk-stable h-2 rounded-full w-4/5" /></div>
                    </div>
                    <p className="text-lg font-bold text-foreground">1 per 2,847 people</p>
                  </div>
                </div>
              </div>
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
              selectedPatientId={selectedPatient?.id ?? null}
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
