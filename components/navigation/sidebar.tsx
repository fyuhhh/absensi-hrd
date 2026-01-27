"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LogOut,
  Settings,
  Table,
  Users,
  LayoutDashboard,
  FolderCog,
  Moon,
  Sun,
  FileCheck,
  ClipboardList,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { signOut } from "@/lib/storage";
import { useTheme } from "@/components/theme-provider";

interface SidebarProps {
  role: "admin" | "user";
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ role, isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const items =
    role === "admin"
      ? [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/employees", label: "Kelola Akun", icon: Users },
        {
          href: "/admin/divisions",
          label: "Pengaturan Divisi",
          icon: FolderCog,
        },
        {
          href: "/admin/settings",
          label: "Pengaturan Jam/Lokasi",
          icon: Settings,
        },
        { href: "/admin/recap", label: "Rekap Full", icon: Table },
        {
          href: "/admin/approvals",
          label: "Approval Lemburan",
          icon: FileCheck,
        },
        {
          href: "/admin/persons",
          label: "Detail Perorang",
          icon: ClipboardList,
        },
      ]
      : [
        { href: "/user", label: "Dashboard", icon: LayoutDashboard },
        {
          href: "/user/overtime",
          label: "Pengajuan Lembur",
          icon: ClipboardList,
        },
      ];

  return (
    <aside className={cn(
      "bg-[#0B1120] text-slate-300 flex flex-col justify-between h-full border-r border-[#1E293B] transition-all duration-300 relative",
      isCollapsed ? "p-4 items-center" : "p-4 md:p-6"
    )}>
      {/* Toggle Button */}
      {onToggle && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="absolute -right-3 top-6 size-6 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 z-50 hidden md:flex"
        >
          {isCollapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
        </Button>
      )}

      <div className="w-full">
        <div className={cn(
          "mb-10 flex items-center gap-3 transition-all duration-300",
          isCollapsed ? "justify-center px-0" : "px-2"
        )}>
          <div className="p-2 bg-blue-600 rounded-lg shrink-0">
            <Shield className="size-6 text-white" />
          </div>
          <div className={cn(
            "overflow-hidden transition-all duration-300 whitespace-nowrap",
            isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
          )}>
            <h1 className="font-bold text-xl text-white tracking-tight">Dashdark X</h1>
            <p className="text-xs text-slate-500 font-medium">HR MANAGEMENT</p>
          </div>
        </div>

        <nav className="grid gap-2 w-full">
          {items.map((it) => {
            const Icon = it.icon;
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                title={isCollapsed ? it.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl py-3 text-sm font-medium transition-all duration-[200ms] ease-out hover:scale-105",
                  isCollapsed ? "justify-center px-2" : "px-4",
                  active
                    ? "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20"
                    : "hover:bg-slate-800 hover:text-white text-slate-400"
                )}
              >
                <Icon className={cn("size-5 shrink-0", active ? "text-white" : "text-slate-500")} />
                {!isCollapsed && (
                  <span className="truncate">{it.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="grid gap-3 w-full">
        <Button
          variant="ghost"
          className={cn(
            "w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all",
            isCollapsed ? "justify-center px-2" : "justify-start"
          )}
          onClick={() => {
            signOut();
            router.replace("/");
          }}
          title={isCollapsed ? "Keluar" : undefined}
        >
          <LogOut className={cn("size-4 shrink-0", !isCollapsed && "mr-2")} />
          {!isCollapsed && "Keluar"}
        </Button>
      </div>
    </aside>
  );
}
