"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ClipboardList, LogOut, MapPin, FileText } from "lucide-react";
import { signOut } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();

    const items = [
        { href: "/user", label: "Beranda", icon: LayoutDashboard },
        { href: "/user/absen", label: "Absen", icon: MapPin },
        { href: "/user/leave", label: "Pengajuan", icon: ClipboardList },
    ];

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
            <div className="flex items-center justify-between h-[72px] px-6 bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl relative">
                
                {/* Regular Nav Items */}
                {items.map((it) => {
                    const Icon = it.icon;
                    const active = pathname === it.href;
                    
                    // Special styling for central 'Absen' button
                    if (it.label === "Absen") {
                        return (
                            <div key={it.href} className="absolute left-1/2 -translate-x-1/2 -top-6">
                                <Link
                                    href={it.href}
                                    className="flex flex-col items-center justify-center gap-1 group"
                                >
                                    <div className={cn(
                                        "p-4 rounded-full shadow-xl transition-all duration-300",
                                        active ? "bg-gradient-to-br from-cyan-500 to-fuchsia-600 scale-110 shadow-[0_0_15px_rgba(192,132,252,0.4)]" : "bg-slate-800 border-2 border-slate-700 group-hover:scale-105"
                                    )}>
                                        <Icon className={cn("size-7", active ? "text-white" : "text-slate-400")} />
                                    </div>
                                    <span className={cn("text-[10px] font-bold mt-1 tracking-wider", active ? "text-fuchsia-400" : "text-slate-400")}>
                                        ABSEN
                                    </span>
                                </Link>
                            </div>
                        )
                    }

                    return (
                        <Link
                            key={it.href}
                            href={it.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1.5 w-16 transition-all",
                                active ? "text-blue-400 scale-110" : "text-slate-400 hover:text-slate-200"
                            )}>
                            <div className={cn(
                                "p-2 rounded-xl transition-colors duration-300",
                                active ? "bg-blue-500/20" : "bg-transparent"
                            )}>
                                <Icon className="size-[22px]" />
                            </div>
                            <span className={cn(
                                "text-[10px] whitespace-nowrap font-semibold transition-colors duration-300",
                                active ? "text-white" : ""
                            )}>
                                {it.label}
                            </span>
                        </Link>
                    );
                })}


            </div>
        </div>
    );
}
