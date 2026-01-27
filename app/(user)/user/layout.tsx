"use client"

import type React from "react"
import { useState } from "react"

import { Sidebar } from "@/components/navigation/sidebar"
import { useRequireRole } from "@/lib/session"

export default function UserLayout({ children }: { children: React.ReactNode }) {
  useRequireRole("user")
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className="min-h-dvh grid bg-[#0B1120] text-slate-100 transition-all duration-300 ease-in-out"
      style={{
        gridTemplateColumns: isCollapsed ? "80px 1fr" : "240px 1fr"
      }}
    >
      <Sidebar
        role="user"
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />
      <div className="p-4 md:p-6">{children}</div>
    </div>
  )
}
