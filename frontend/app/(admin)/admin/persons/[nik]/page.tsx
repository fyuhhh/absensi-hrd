"use client";

import { useDB } from "@/lib/storage";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import ExcelJS from "exceljs";
import dynamic from "next/dynamic";
import { useState, useEffect, useMemo } from "react";
import { 
  User, 
  FileSpreadsheet, 
  MapPin, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Fingerprint, 
  Building2, 
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Activity,
  History,
  Download,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Employee, Attendance, Overtime } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

const OfficeMap = dynamic(() => import("@/components/OfficeMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-500 text-[10px] uppercase font-black">Inisialisasi Peta...</div>
});

export default function PersonDetailPage() {
  const { nik } = useParams() as { nik: string };
  const { data } = useDB();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const emp = data?.employees.find((e: Employee) => e.nik === nik);
  
  const attendance = useMemo(() => (data?.attendance.filter((a: Attendance) => a.nik === nik) || []), [data, nik]);
  const overtime = useMemo(() => (data?.overtime.filter((o: Overtime) => o.nik === nik && o.status === "approved") || []), [data, nik]);

  // Merge & Sort Activity Timeline
  const timeline = useMemo(() => {
    const combined = [
        ...attendance.map((a: Attendance) => ({ ...a, type: 'attendance' as const })),
        ...overtime.map((o: Overtime) => ({ ...o, type: 'overtime' as const }))
    ];
    return combined.sort((a, b) => b.date.localeCompare(a.date));
  }, [attendance, overtime]);

  // Stats
  const stats = useMemo(() => {
     return {
        totalAttendance: attendance.length,
        totalOvertime: overtime.length,
        avgIn: attendance.length ? 'TBD' : '-', // Logic for average in if needed
     }
  }, [attendance, overtime]);

  async function handleExportExcel() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Absensi & Lembur");

    sheet.columns = [
      { header: "NIK", key: "NIK", width: 15 },
      { header: "Nama", key: "Nama", width: 25 },
      { header: "Tanggal", key: "Tanggal", width: 15 },
      { header: "In", key: "In", width: 10 },
      { header: "Out", key: "Out", width: 10 },
      { header: "Keterangan", key: "Keterangan", width: 30 },
      { header: "Tipe", key: "Tipe", width: 15 },
    ];

    timeline.forEach((item: any) => {
      sheet.addRow({
        NIK: emp?.nik || "-",
        Nama: emp?.name || "-",
        Tanggal: item.date,
        In: item.inTime || "-",
        Out: item.outTime || "-",
        Keterangan: item.note || "-",
        Tipe: item.type === 'attendance' ? 'Absen' : 'Lembur',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Histori_${emp?.nik || "karyawan"}.xlsx`;
    a.click();
  }

  const office = {
    lat: data?.settings.officeLat ?? -1.273985438554323,
    lng: data?.settings.officeLng ?? 116.85826015112536,
  };
  const radius = data?.settings.radiusMeters ?? 200;
  const lastAttendance = attendance[0];
  const userCoords = lastAttendance && lastAttendance.lat && lastAttendance.lng ? [lastAttendance.lat, lastAttendance.lng] : null;

  if (!emp && data?.employees.length > 0) {
      return (
        <main className="min-h-screen flex items-center justify-center p-4">
            <Card className="bg-slate-900 border-slate-800 text-white rounded-[3rem] p-10 text-center max-w-md w-full shadow-2xl">
                <div className="size-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <User className="size-10 text-rose-500" />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic italic">Employee <span className="text-rose-500">Not Found</span></h2>
                <p className="text-slate-500 text-xs mt-2 leading-relaxed">NIK {nik} tidak terdaftar di sistem pusat kami.</p>
                <Button onClick={() => router.push('/admin/persons')} className="mt-8 bg-slate-800 hover:bg-slate-700 w-full rounded-2xl h-12 font-bold uppercase tracking-widest text-[10px]">
                   Kembali ke Database
                </Button>
            </Card>
        </main>
      );
  }

  return (
    <main className="space-y-6 pb-24 max-w-5xl mx-auto px-2">
      {/* Header section */}
      <div className="flex flex-col gap-4">
        <Link 
            href="/admin/persons" 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-500 transition-all group w-fit"
        >
            <div className="p-1 bg-slate-900 border border-slate-800 rounded-lg group-hover:border-blue-500 transition-all">
                <ArrowLeft className="size-3" />
            </div>
            Kembali ke Daftar
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                    Profil <span className="text-blue-500">Karyawan</span>
                </h1>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none">Arsip Digital Kepegawaian</p>
            </div>
            <Button
                onClick={handleExportExcel}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl h-12 px-6 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 w-fit"
            >
                <Download className="size-4 mr-2" />
                Export Data (.xlsx)
            </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Info Cards */}
        <div className="lg:col-span-5 space-y-6">
            {/* Identity Card */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="bg-slate-900/50 border-slate-800 text-white rounded-[2.5rem] shadow-2xl backdrop-blur-md overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Fingerprint className="size-32" />
                    </div>
                    <CardContent className="p-8 space-y-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="size-16 rounded-[1.5rem] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                <User className="size-8 text-blue-500" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-2xl font-black uppercase tracking-tighter truncate">{emp?.name}</h2>
                                <p className="text-[10px] font-mono tracking-[0.3em] text-slate-500"># {emp?.nik}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl">
                                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1.5 mb-1">
                                    <Building2 className="size-3" /> Divisi
                                </p>
                                <p className="font-bold text-xs uppercase">{emp?.division}</p>
                            </div>
                            <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl">
                                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1.5 mb-1">
                                    <ShieldCheck className="size-3" /> Status
                                </p>
                                <Badge className={cn(
                                    "px-0 h-auto bg-transparent text-[10px] uppercase font-black tracking-widest",
                                    emp?.status === 'active' ? "text-emerald-500" : "text-rose-500"
                                )}>
                                    {emp?.status === 'active' ? '● Aktif' : '● Off'}
                                </Badge>
                            </div>
                        </div>

                        {emp?.periodeStart && (
                            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Calendar className="size-4 text-blue-500" />
                                    <div>
                                        <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-none">Masa Kontrak</p>
                                        <p className="text-[10px] font-bold mt-1 uppercase text-blue-100">{emp.periodeStart} — {emp.periodeEnd}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Map Card */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <Card className="bg-slate-900/50 border-slate-800 text-white rounded-[2.5rem] shadow-2xl backdrop-blur-md overflow-hidden relative">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <MapPin className="size-4 text-rose-500" /> Geofence Tracking
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <div className="aspect-square w-full rounded-[2rem] overflow-hidden border border-slate-800 bg-slate-950/50 relative z-0 shadow-inner">
                            {isMounted && (
                                <OfficeMap
                                    lat={office.lat}
                                    lng={office.lng}
                                    radius={radius}
                                    userLat={userCoords?.[0]}
                                    userLng={userCoords?.[1]}
                                />
                            )}
                            <div className="absolute top-4 left-4 z-[400] bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/50">
                                <p className="text-[8px] text-rose-400 font-black uppercase tracking-widest italic">Live Geo-Index</p>
                            </div>
                        </div>
                        <p className="text-[8px] text-center text-slate-500 uppercase tracking-widest mt-4 font-bold">* Berdasarkan koordinat check-in terakhir tercatat</p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>

        {/* Right: Activity Timeline */}
        <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                        <Activity className="size-4 text-orange-500" />
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-white italic">Activity Timeline</h2>
                </div>
                <Badge className="bg-slate-800 text-slate-400 border-none font-black text-[9px] uppercase">{timeline.length} Logs</Badge>
            </div>

            <div className="space-y-4 max-h-[1000px] overflow-y-auto pr-2 scrollbar-hide">
                <AnimatePresence>
                    {timeline.map((item: any, i: number) => (
                        <motion.div
                            key={`${item.type}-${item.date}-${i}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card className={cn(
                                "border transition-all duration-300 rounded-[1.8rem] overflow-hidden relative group",
                                item.type === 'overtime' 
                                    ? "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10" 
                                    : "bg-slate-900/40 border-slate-800 hover:border-blue-500/20 hover:bg-slate-900/60"
                            )}>
                                {/* Glow indicator */}
                                <div className={cn(
                                    "absolute top-0 bottom-0 left-0 w-1",
                                    item.type === 'overtime' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                )} />

                                <CardContent className="p-5 sm:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-black uppercase text-white tracking-widest">{item.date}</p>
                                                <Badge className={cn(
                                                    "text-[8px] font-black uppercase tracking-widest h-5 px-2 border-none",
                                                    item.type === 'overtime' ? "bg-amber-500/20 text-amber-500" : "bg-blue-500/10 text-blue-400"
                                                )}>
                                                    {item.type === 'overtime' ? 'EXTRA WORK' : 'REGULAR'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 mt-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                                                    <span className="text-[10px] font-mono font-bold text-slate-300 italic">{item.inTime || '??:??'}</span>
                                                </div>
                                                <div className="w-4 h-[1px] bg-slate-700" />
                                                <div className="flex items-center gap-2">
                                                    <div className="size-1.5 rounded-full bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.5)]" />
                                                    <span className="text-[10px] font-mono font-bold text-slate-300 italic">{item.outTime || '??:??'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-right">
                                            <p className="text-[10px] font-bold text-slate-500 italic max-w-[200px] truncate sm:ml-auto">
                                                {item.note || 'No description logged'}
                                            </p>
                                            {item.type === 'attendance' && (
                                                <div className="flex flex-col items-end gap-2">
                                                    {(item.in_photo || item.inPhoto) && (
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <div className="relative size-12 rounded-xl overflow-hidden border border-slate-700 bg-black group-hover:border-blue-500/50 transition-colors cursor-zoom-in">
                                                                    <img src={item.in_photo || item.inPhoto} className="size-full object-cover" alt="Check-in Photo" />
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                        <ExternalLink className="size-3 text-white" />
                                                                    </div>
                                                                </div>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-3xl p-0 border-none bg-transparent shadow-none">
                                                                <DialogHeader className="hidden">
                                                                    <DialogTitle>Check-in Photo</DialogTitle>
                                                                    <DialogDescription>Preview foto absensi masuk</DialogDescription>
                                                                </DialogHeader>
                                                                <div className="relative aspect-[3/4] w-full max-h-[80vh] flex items-center justify-center">
                                                                    <img 
                                                                        src={item.in_photo || item.inPhoto} 
                                                                        className="w-full h-full object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]" 
                                                                        alt="Full Size Photo" 
                                                                    />
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    )}
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-600">Sync Status:</span>
                                                        <Badge className="bg-emerald-500/10 text-emerald-500 p-0 hover:bg-emerald-500/10 border-none uppercase text-[8px] font-black tracking-widest">
                                                            VERIFIED
                                                        </Badge>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {timeline.length === 0 && (
                    <div className="py-20 text-center space-y-4">
                        <div className="size-16 bg-slate-900 border border-slate-800 rounded-[1.5rem] flex items-center justify-center mx-auto opacity-20">
                            <History className="size-8 text-slate-500" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">No activity history available for this record</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </main>
  );
}
