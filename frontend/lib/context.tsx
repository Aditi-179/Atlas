"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react"

export type Role = "NGO Admin" | "Field Worker"

interface AppContextType {
  role: Role
  setRole: (role: Role) => void
  copilotOpen: boolean
  setCopilotOpen: (open: boolean | ((prev: boolean) => boolean)) => void
  pendingCopilotMessage?: string
  setPendingCopilotMessage: (msg: string | undefined) => void
  askCopilot: (question: string) => void
  selectedPatient: any | null
  setSelectedPatient: (p: any | null) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("NGO Admin")
  const [copilotOpen, setCopilotOpen] = useState(true)
  const [pendingCopilotMessage, setPendingCopilotMessage] = useState<string | undefined>()
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)

  const askCopilot = useCallback((question: string) => {
    setPendingCopilotMessage(question)
    setCopilotOpen(true)
  }, [])

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        copilotOpen,
        setCopilotOpen,
        pendingCopilotMessage,
        setPendingCopilotMessage,
        askCopilot,
        selectedPatient,
        setSelectedPatient
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) throw new Error("useAppContext must be used within AppProvider")
  return context
}
