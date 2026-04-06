"use client";

import { motion } from "framer-motion";
import { ClipboardList, FileText, ChevronRight, History } from "lucide-react";
import Link from "next/link";

export default function PengajuanHubPage() {
    const menus = [
        {
            title: "Izin / Sakit",
            desc: "Ajukan ketidakhadiran kerja dengan bukti foto.",
            href: "/user/leave/form",
            icon: FileText,
            color: "text-cyan-400",
            bg: "bg-cyan-400/10",
            border: "border-cyan-400/20"
        },
        {
            title: "Lembur",
            desc: "Ajukan penambahan jam kerja di luar jadwal.",
            href: "/user/overtime",
            icon: ClipboardList,
            color: "text-fuchsia-400",
            bg: "bg-fuchsia-400/10",
            border: "border-fuchsia-400/20"
        }
    ];

    return (
        <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-24 md:pb-10 max-w-2xl mx-auto"
        >
            <div className="px-2">
                <h1 className="text-3xl font-black text-white tracking-tight">
                    Pusat <span className="text-cyan-400">Pengajuan</span>
                </h1>
                <p className="text-slate-400 text-sm mt-2 font-medium">
                    Pilih jenis permohonan yang ingin Anda ajukan hari ini.
                </p>
            </div>

            <div className="grid gap-4 px-2">
                {menus.map((item, i) => (
                    <Link key={i} href={item.href}>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`group relative overflow-hidden bg-slate-900/60 backdrop-blur-md border ${item.border} rounded-3xl p-6 flex items-center justify-between transition-all hover:bg-slate-800/80`}
                        >
                            <div className="flex items-center gap-5">
                                <div className={`p-4 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                                    <item.icon className="size-8" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-wider">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-400 text-xs mt-1 font-medium leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="size-6 text-slate-600 group-hover:text-white transition-colors" />
                            
                            {/* Animated Background Glow */}
                            <div className="absolute -right-10 -top-10 size-32 bg-cyan-500/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.div>
                    </Link>
                ))}
            </div>

            <div className="px-2 mt-12">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-widest text-[11px] opacity-60">
                        <History className="size-4" />
                        AKTIVITAS TERAKHIR
                    </h2>
                </div>
                <div className="space-y-3">
                    <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 border-dashed text-center">
                        <p className="text-slate-500 text-sm font-medium">Belum ada riwayat pengajuan baru.</p>
                    </div>
                </div>
            </div>
        </motion.main>
    );
}
