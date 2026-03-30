"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

export type AppRole = "admin" | "field"

type RoleContextValue = {
  role: AppRole
  setRole: (role: AppRole) => void
  toggleRole: () => void
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<AppRole>("admin")

  useEffect(() => {
    const saved = window.localStorage.getItem("careflow-role")
    if (saved === "admin" || saved === "field") {
      setRoleState(saved)
    }
  }, [])

  const setRole = (next: AppRole) => {
    setRoleState(next)
    window.localStorage.setItem("careflow-role", next)
  }

  const toggleRole = () => {
    setRole(role === "admin" ? "field" : "admin")
  }

  const value = useMemo(() => ({ role, setRole, toggleRole }), [role])
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) {
    throw new Error("useRole must be used within RoleProvider")
  }
  return ctx
}
