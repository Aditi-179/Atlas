"use client"

import { AppShell } from "@/components/app-shell"

export default function SettingsPage() {
  return (
    <AppShell title="Settings" subtitle="Workspace preferences and NGO account configuration">
      <div className="space-y-3">
        <article className="rounded-2xl bg-white/85 px-4 py-4">
          <p className="font-semibold">User Account</p>
          <p className="text-sm text-[#0f172a]/65">Aditi Sharma - NGO Admin</p>
        </article>
        <article className="rounded-2xl bg-white/85 px-4 py-4">
          <p className="font-semibold">Data Preferences</p>
          <p className="text-sm text-[#0f172a]/65">Weekly sync enabled, secure exports only.</p>
        </article>
      </div>
    </AppShell>
  )
}
