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
} from "lucide-react";
import { signOut } from "@/lib/storage";
import { useTheme } from "@/components/theme-provider";

export function Sidebar({ role }: { role: "admin" | "user" }) {
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
    <aside className="bg-[#0B1120] text-slate-300 p-4 md:p-6 flex flex-col justify-between h-full border-r border-[#1E293B]">
      <div>
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Shield className="size-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-white tracking-tight">Dashdark X</h1>
            <p className="text-xs text-slate-500 font-medium">HR MANAGEMENT</p>
          </div>
        </div>

        <nav className="grid gap-2">
          {items.map((it) => {
            const Icon = it.icon;
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-[800ms] ease-out hover:duration-75 hover:scale-105",
                  active
                    ? "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/20"
                    : "hover:bg-slate-800 hover:text-white text-slate-400"
                )}
              >
                <Icon className={cn("size-5", active ? "text-white" : "text-slate-500")} />
                {it.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="grid gap-3">
        {/* <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
           <p className="text-xs text-slate-500 mb-2">Dark Mode</p>
           <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Theme</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-slate-400 hover:text-white"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
           </div>
        </div> */}

        <Button
          variant="ghost"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
          onClick={() => {
            signOut();
            router.replace("/");
          }}
        >
          <LogOut className="size-4 mr-2" />
          Keluar
        </Button>
      </div>
    </aside>
  );
}
