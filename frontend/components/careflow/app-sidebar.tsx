"use client"

import { cn } from "@/lib/utils"
import { Activity, Bell, LogOut, ChevronDown, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  role: "NGO Admin" | "Field Worker"
  onRoleChange: (role: "NGO Admin" | "Field Worker") => void
}

export function AppSidebar({ activeView, onViewChange, role, onRoleChange }: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Macro-Radar", icon: "📊" },
    { id: "population", label: "Population", icon: "👥" },
    { id: "vitals", label: "Vitals Monitor", icon: "❤️" },
    { id: "regions", label: "Regions", icon: "🌍" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ]

  return (
    <aside className="flex flex-col w-64 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="relative">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
            <Activity className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-teal-500 rounded-full ring-2 ring-sidebar" />
        </div>
        <div>
          <p className="text-sm font-semibold text-sidebar-foreground leading-none tracking-tight">
            CareFlow<span className="font-normal text-primary">AI</span>
          </p>
          <p className="text-[10px] text-sidebar-foreground/40 mt-1 uppercase tracking-[0.15em] font-medium">NCD OS</p>
        </div>
      </div>

      {/* Role Switcher */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between text-sidebar-foreground hover:bg-sidebar-accent h-9 px-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
                <span className="text-xs font-medium">{role}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => onRoleChange("NGO Admin")}>
              NGO Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRoleChange("Field Worker")}>
              Field Worker
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-2 mb-2">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent"
              )}
            >
              <span>{item.icon}</span>
              {item.label}
              {item.id === "dashboard" && (
                <Badge className="ml-auto text-[10px] h-4 px-1.5 bg-red-500/20 text-red-500 border-0">
                  47
                </Badge>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-sidebar-border space-y-2">
        <div className="flex items-center gap-2 px-1">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-primary">DA</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">Dr. Ada Mensah</p>
            <p className="text-[10px] text-sidebar-foreground/50 truncate">{role}</p>
          </div>
          <button className="p-1 hover:bg-sidebar-accent rounded">
            <Bell className="w-3.5 h-3.5 text-sidebar-foreground/50" />
          </button>
        </div>
        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg">
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
