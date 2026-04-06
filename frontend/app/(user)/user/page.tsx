"use client";

import { Button } from "@/components/ui/button";
import { ClockDisplay } from "@/components/clock";
import {
  useCurrentUser,
  signOut,
  useDB,
  type Attendance
} from "@/lib/storage";
import { useEffect, useMemo, useState } from "react";
import { todayYMD } from "@/lib/time";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  LogIn,
  LogOut,
  Coffee,
  Clock,
  Calendar,
  FileText,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Timer,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function UserDashboardPage() {
  const user = useCurrentUser();
  const { data } = useDB();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const today = todayYMD();
  const todayAttendance = data?.attendance.find(
    (a: Attendance) => a.nik === user?.nik && a.date === today
  );

  const status = useMemo(() => {
    if (!todayAttendance) return { label: "Belum Absen", color: "text-rose-400", bg: "bg-rose-400/10", icon: AlertCircle };
    if (todayAttendance.outTime) return { label: "Sudah Pulang", color: "text-blue-400", bg: "bg-blue-400/10", icon: CheckCircle2 };
    return { label: "Sedang Bekerja", color: "text-emerald-400", bg: "bg-emerald-400/10", icon: Timer };
  }, [todayAttendance]);

  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const myHistory = data?.attendance.filter((a: Attendance) => a.nik === user?.nik) || [];

    const thisMonth = myHistory.filter((a: Attendance) => {
      const d = new Date(a.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalHours = thisMonth.reduce((acc: number, curr: Attendance) => acc + (Number(curr.totalHours) || 0), 0);
    const totalLates = thisMonth.filter((a: Attendance) => (a.lateMinutes || 0) > 0).length;

    return { totalHours, totalLates, totalDays: thisMonth.length };
  }, [data, user]);

  const quickActions = [
    { title: "Absen", desc: "Masuk/Pulang", icon: MapPin, color: "from-blue-500 to-cyan-500", href: "/user/absen" },
    { title: "Izin/Sakit", desc: "Ajukan Izin", icon: FileText, color: "from-purple-500 to-indigo-500", href: "/user/leave/form" },
    { title: "Lembur", desc: "Ajukan Lembur", icon: Zap, color: "from-amber-500 to-orange-500", href: "/user/overtime" },
  ];

  if (!isMounted) return null;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-24 md:pb-10 max-w-4xl mx-auto"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="text-blue-400">{user?.name || "Karyawan"}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Sudah siap bekerja hari ini?</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { signOut(); window.location.href = "/"; }}
          className="text-slate-500 hover:text-rose-400 hover:bg-rose-400/5 rounded-full"
        >
          <LogOut className="size-4" />
        </Button>
      </div>

      {/* Main Status Display */}
      <motion.div
        initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="relative overflow-hidden bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 backdrop-blur-md shadow-2xl"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Clock className="size-32 text-blue-400 rotate-12" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className={`mb-4 px-4 py-1.5 rounded-full ${status.bg} ${status.color} text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border border-current/20`}>
            <status.icon className="size-3" />
            {status.label}
          </div>
          <ClockDisplay className="text-5xl font-black text-white tracking-tighter" />
          <div className="mt-2 text-slate-500 font-mono text-xs uppercase tracking-widest">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-xs">
            <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50 text-center">
              <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Masuk</p>
              <p className="text-sm font-mono text-white">{todayAttendance?.inTime || "--:--"}</p>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50 text-center">
              <p className="text-[9px] text-slate-500 uppercase font-bold mb-1">Pulang</p>
              <p className="text-sm font-mono text-white">{todayAttendance?.outTime || "--:--"}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 px-1">
        {quickActions.map((action, idx) => (
          <Link key={idx} href={action.href}>
            <motion.div
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`h-full p-4 rounded-3xl bg-gradient-to-br ${action.color} shadow-lg shadow-current/10 group relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:scale-125 transition-transform">
                <action.icon className="size-12 text-white" />
              </div>
              <div className="p-2 bg-white/20 rounded-xl w-fit mb-3">
                <action.icon className="size-5 text-white" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">{action.title}</h3>
              <p className="text-[9px] text-white/70 font-medium">{action.desc}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Monthly Stats Section */}
      <div className="grid grid-cols-2 gap-4 px-1">
        <div className="bg-indigo-600 p-5 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
            <Timer className="size-24 text-white" />
          </div>
          <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-1">Jam Kerja</p>
          <h4 className="text-3xl font-black text-white">{stats.totalHours.toFixed(1)} <span className="text-xs opacity-50">Jam</span></h4>
          <p className="text-[9px] text-white/40 mt-2 italic">Total bulan ini</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] shadow-xl">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Terlambat</p>
          <h4 className={`text-3xl font-black ${stats.totalLates > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>{stats.totalLates} <span className="text-xs opacity-50">Kali</span></h4>
          <div className="mt-2 flex items-center gap-1">
            <Badge className="bg-slate-800 text-[8px] px-1.5 py-0 border-slate-700">{stats.totalDays} Hari Kerja</Badge>
          </div>
        </div>
      </div>

      {/* Recent Activity Mini-List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Clock className="size-4 text-blue-400" />
            Riwayat Terakhir
          </h2>
          <Link href="#" className="text-[10px] text-blue-400 font-bold hover:underline flex items-center">
            SELENGKAPNYA <ChevronRight className="size-2" />
          </Link>
        </div>

        <div className="space-y-2 px-1">
          {data?.attendance
            .filter((a: any) => a.nik === user?.nik)
            .slice(0, 3)
            .map((row: any, i: number) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800 p-3 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-8 bg-slate-800 rounded-lg flex items-center justify-center">
                    <Calendar className="size-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{new Date(row.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</p>
                    <p className="text-[9px] text-slate-500 font-mono">{row.inTime || "--:--"} - {row.outTime || "--:--"}</p>
                  </div>
                </div>
                <Badge className={`text-[9px] ${row.note?.includes("Terlambat") ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                  {row.note?.includes("Terlambat") ? 'Telat' : 'Tepat'}
                </Badge>
              </div>
            ))}
        </div>
      </div>
    </motion.main>
  );
}
