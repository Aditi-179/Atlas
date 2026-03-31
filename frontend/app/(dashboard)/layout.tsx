"use client"

import { AppSidebar } from "@/components/careflow/app-sidebar"
import { CopilotSidebar } from "@/components/careflow/copilot-sidebar"
import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"
import { useAppContext } from "@/lib/context"
import { ReactNode } from "react"
import { usePathname } from "next/navigation"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { copilotOpen, setCopilotOpen, pendingCopilotMessage, setPendingCopilotMessage, selectedPatient } = useAppContext()
  const pathname = usePathname()

  // Derive title from pathname
  let pageTitle = "Macro-Radar"
  if (pathname.includes("/population")) pageTitle = "Population Analytics"
  if (pathname.includes("/vitals")) pageTitle = "Vitals Monitor"
  if (pathname.includes("/regions")) pageTitle = "Regional Analysis"
  if (pathname.includes("/settings")) pageTitle = "Settings"
  if (pathname.includes("/patients/")) pageTitle = "Patient Deep-Dive"

  return (
    <div className="flex h-screen bg-background overflow-hidden w-full">
      {/* Left Sidebar */}
      <AppSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-background/80 backdrop-blur-md border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-medium text-foreground text-sm">
              {pageTitle}
            </span>
            {selectedPatient && pathname.includes("/patients/") && (
              <>
                <span className="text-border">/</span>
                <span className="text-primary font-medium text-sm">{selectedPatient.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
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
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </main>

      {/* Right Copilot Sidebar */}
      <CopilotSidebar
        patient={selectedPatient}
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        pendingMessage={pendingCopilotMessage}
        onPendingMessageConsumed={() => setPendingCopilotMessage(undefined)}
      />
    </div>
  )
}
