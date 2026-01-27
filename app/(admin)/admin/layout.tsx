"use client"

import type React from "react"
import { useState } from "react"

import { Sidebar } from "@/components/navigation/sidebar"
import { useRequireRole } from "@/lib/session"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useRequireRole("admin")
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className="min-h-dvh grid bg-[#0B1120] text-slate-100 transition-all duration-300 ease-in-out"
      style={{
        gridTemplateColumns: isCollapsed ? "80px 1fr" : "280px 1fr"
      }}
    >
      <Sidebar
        role="admin"
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />
      <div className="p-8">{children}</div>
    </div>
  )
}
