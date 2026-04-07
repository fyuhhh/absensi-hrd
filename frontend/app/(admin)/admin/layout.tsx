"use client"

import type React from "react"
import { useState } from "react"

import { Sidebar } from "@/components/navigation/sidebar"
import { useRequireRole, useSession } from "@/lib/session"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isReady } = useRequireRole(["admin", "admin_tj"])
  const { session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Prevent flash of protected content before auth check
  if (!isReady || !session) return (
    <div className="min-h-dvh flex items-center justify-center bg-[#0B1120]">
      <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )

  const currentRole = session.role

  return (
    <div
      className="min-h-dvh flex flex-col md:grid bg-[#0B1120] text-slate-100 transition-all duration-300 ease-in-out"
      style={{
        gridTemplateColumns: isCollapsed ? "80px 1fr" : "280px 1fr"
      }}
    >
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-[#0B1120] sticky top-0 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-200">
              <Menu className="size-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-r-slate-800 bg-[#0B1120] w-[280px] text-slate-100">
            <SheetTitle className="sr-only">Menu Admin</SheetTitle>
            <Sidebar role={currentRole as any} />
          </SheetContent>
        </Sheet>
        <span className="font-bold text-lg">Admin Panel</span>
        <div className="w-6" /> {/* Spacer for balance */}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full min-h-dvh relative z-10 overflow-hidden">
        <Sidebar
          role={currentRole as any}
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Content */}
      <div className="p-4 md:p-8 overflow-x-hidden min-w-0 md:col-start-2">
        {children}
      </div>
    </div>
  )
}
