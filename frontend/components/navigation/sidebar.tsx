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
  ChevronRight,
  ChevronLeft,
  MapPin,
  FileText,
} from "lucide-react";
import { signOut, usePendingCounts } from "@/lib/storage";
import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  role: "admin" | "user" | "admin_tj";
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ role, isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { pendingOvertimeCount, pendingLeaveCount } = usePendingCounts();

  let items = [];

  if (role === "admin") {
    items = [
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
      {
        href: "/admin/schedules",
        label: "Jadwal Karyawan",
        icon: ClipboardList,
      },
      { href: "/admin/recap", label: "Rekap Full", icon: Table },
      {
        href: "/admin/approvals",
        label: "Approval Lemburan",
        icon: FileCheck,
        badge: pendingOvertimeCount > 0 ? pendingOvertimeCount : null
      },
      {
        href: "/admin/persons",
        label: "Detail Perorang",
        icon: ClipboardList,
      },
      { 
        href: "/admin/leave", 
        label: "Pengajuan Izin", 
        icon: FileText,
        badge: pendingLeaveCount > 0 ? pendingLeaveCount : null
      },
    ];
  } else if (role === "admin_tj") {
    items = [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      {
        href: "/admin/schedules",
        label: "Jadwal Karyawan",
        icon: ClipboardList,
      },
    ];
  } else {
    items = [
      { href: "/user", label: "Dashboard", icon: LayoutDashboard },
      { href: "/user/absen", label: "Absen", icon: MapPin },
      {
        href: "/user/overtime",
        label: "Pengajuan Lembur",
        icon: ClipboardList,
      },
      { href: "/user/leave", label: "Pengajuan Izin", icon: FileText },
    ];
  }

  return (
    <aside className={cn(
      "bg-[#0B1120] text-slate-300 flex flex-col justify-between min-h-dvh border-r border-[#1E293B] transition-all duration-300 relative overflow-visible w-full",
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
            <h1 className="font-black text-2xl text-white tracking-tighter italic uppercase">Absenin</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">HR MANAGEMENT</p>
          </div>
        </div>

        <nav className="grid gap-2 w-full flex-1" style={{ overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {items.map((it) => {
            const Icon = it.icon;
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                title={isCollapsed ? it.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl py-3 text-sm font-medium transition-all duration-[200ms] ease-out hover:scale-105 relative",
                  isCollapsed ? "justify-center px-2" : "px-4",
                  active
                    ? "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20"
                    : "hover:bg-slate-800 hover:text-white text-slate-400"
                )}
              >
                <Icon className={cn("size-5 shrink-0", active ? "text-white" : "text-slate-500")} />
                {!isCollapsed ? (
                  <div className="flex flex-1 items-center justify-between min-w-0">
                    <span className="truncate">{it.label}</span>
                    {it.badge && (
                      <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-none size-5 p-0 flex items-center justify-center text-[10px] font-black rounded-full shrink-0 ml-2 animate-pulse">
                        {it.badge}
                      </Badge>
                    )}
                  </div>
                ) : (
                    it.badge && (
                        <div className="absolute top-2 right-2 size-2 bg-rose-500 rounded-full border border-[#0B1120] animate-pulse" />
                    )
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800 mt-auto grid gap-3 w-full shrink-0">
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
