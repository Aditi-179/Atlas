"use client"

import { useAppContext } from "@/lib/context"

export default function SettingsPage() {
  const { role } = useAppContext()

  return (
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
  )
}
