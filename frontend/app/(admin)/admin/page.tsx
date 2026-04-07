"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { useAdminDashboard, useSchedulerSummary, type Employee, type Attendance } from "@/lib/storage"
import { useSession } from "@/lib/session"
import { todayYMD } from "@/lib/time"
import { Users, UserCheck, UserX, Clock, ArrowUpRight, TrendingUp, MoreHorizontal, FileText, ChevronRight, Activity, Zap, AlertCircle, BarChart3, PieChart, LineChart, PlusCircle } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { ClockDisplay } from "@/components/clock"
import { Button } from "@/components/ui/button"
import { AttendanceChart, DailyStatusChart, DivisionStatsChart, OvertimeTrendChart } from "@/components/AdminCharts"
import { ModernCard } from "@/components/ui/modern-card"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend: string;
  color: string;
  subtext: string;
  onClick?: () => void;
}

const StatCard = ({ title, value, icon: Icon, trend, color, subtext, onClick }: StatCardProps) => (
  <motion.div
    whileHover={{ y: -5 }}
    whileTap={{ scale: 0.98 }}
    className={`bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 relative overflow-hidden group transition-all ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <div className={`absolute -right-4 -bottom-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${color} text-white`}>
      <Icon className="size-24" />
    </div>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-20 text-white shadow-lg shadow-black/20`}>
        <Icon className="size-5" />
      </div>
      <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20 uppercase tracking-wider">
        <TrendingUp className="size-3" />
        {trend}
      </div>
    </div>
    <div className="relative z-10">
      <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.15em] mb-1">{title}</h3>
      <p className="text-3xl font-black text-white mb-1 tracking-tighter">{value}</p>
      <p className="text-[10px] text-slate-600 font-medium">{subtext}</p>
    </div>
  </motion.div>
)

export default function AdminDashboardPage() {
  const router = useRouter()
  const { session } = useSession()
  const { data: dashData, isLoading: isDashLoading } = useAdminDashboard()
  const { summary, isLoading: isSummaryLoading } = useSchedulerSummary()
  const [modalType, setModalType] = useState<'present' | 'absent' | 'late' | null>(null)

  const isLoading = isDashLoading || isSummaryLoading || !session;
  const role = session?.role;

  const today = todayYMD()

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px] text-slate-400 font-mono text-sm tracking-widest animate-pulse">MEMUAT DASHBOARD...</div>

  if (role === 'admin_tj') {
    return (
      <motion.main
        className="space-y-8 pb-10 max-w-6xl mx-auto px-2"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
              Ringkasan <span className="text-fuchsia-500">Jadwal Khusus</span>
            </h1>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Daftar Override Jadwal Karyawan</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-2xl">
             <ClockDisplay />
          </div>
        </div>

        <section className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <StatCard
            title="Total Override"
            value={summary.length}
            icon={Clock}
            trend="Active"
            color="bg-fuchsia-600"
            subtext="Jadwal Khusus Teratur"
          />
          <StatCard
            title="Karyawan"
            value={new Set(summary.map((s: any) => s.nik)).size}
            icon={Users}
            trend="Total"
            color="bg-blue-600"
            subtext="Mendapat Jadwal Khusus"
          />
          <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-6 flex flex-col justify-center items-center text-center">
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Aksi Cepat</p>
             <Button 
                onClick={() => router.push('/admin/schedules')}
                className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-2xl px-6 h-11 font-bold shadow-lg shadow-fuchsia-500/20 active:scale-95 transition-all w-full"
             >
                <PlusCircle className="size-4 mr-2" />
                Atur Jadwal Baru
             </Button>
          </div>
        </section>

        <section className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl backdrop-blur-sm">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Histori & Jadwal Terdata</h3>
              <Badge className="bg-fuchsia-500/20 text-fuchsia-500 border-none font-black text-[10px] px-3 py-1 uppercase tracking-widest">REALTIME</Badge>
           </div>
           
           <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-slate-800">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Karyawan</TableHead>
                    <TableHead className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-center">Tanggal</TableHead>
                    <TableHead className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-center">Jam Kerja</TableHead>
                    <TableHead className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-slate-600 italic text-sm border-none">Belum ada jadwal khusus yang diatur.</TableCell>
                    </TableRow>
                  ) : (
                    summary.map((s: any) => {
                      const isPast = new Date(s.date) < new Date(new Date().setHours(0,0,0,0));
                      return (
                        <TableRow key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                          <TableCell className="py-4">
                            <span className="text-sm font-bold text-white uppercase tracking-tight">{s.name}</span>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{s.nik}</p>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="bg-slate-800/50 border-slate-700 text-slate-300 font-bold text-[10px]">
                              {new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(s.date))}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                               <Clock className="size-3 text-blue-500" />
                               <span className="text-xs font-black text-blue-400 font-mono">{(s.startTime || s.start_time) || '-'} - {(s.endTime || s.end_time) || '-'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                             {isPast ? (
                               <Badge className="bg-slate-800 text-slate-500 border-none text-[8px] font-black uppercase tracking-tighter">Selesai</Badge>
                             ) : (
                               <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black uppercase tracking-tighter shadow-lg shadow-emerald-500/20">Aktif</Badge>
                             )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
           </div>
        </section>
      </motion.main>
    )
  }

  const totalEmployeesCount = dashData?.totalEmployees || 0
  const presentCount = dashData?.presentCount || 0
  const presentList = dashData?.todaysAttendance || []
  const lateCount = dashData?.lateCount || 0
  const recentActivity = dashData?.recentActivity || []
  const chartData = dashData?.chartData || []
  const divisionStats = dashData?.divisionStats || []
  const overtimeTrends = dashData?.overtimeTrends || []
  
  const absentCount = totalEmployeesCount - presentCount
  const absentList: Employee[] = [] // Logic for absent list skip for now
  const lateList = presentList.filter((a: Attendance) => (a.lateMinutes || 0) > 0)
  const avgLateMins = lateList.length > 0
    ? Math.round(lateList.reduce((acc: number, curr: Attendance) => acc + (curr.lateMinutes || 0), 0) / lateList.length)
    : 0

  const handleExportDashboardPDF = () => {
    const doc = new jsPDF()
    const companyName = "Absenin"
    const reportTitle = "Laporan Kehadiran Harian"
    const dateStr = new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    const timeStr = new Date().toLocaleTimeString("id-ID")
    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, doc.internal.pageSize.width, 50, "F")
    doc.setFontSize(24)
    doc.setTextColor(255, 255, 255)
    doc.text(companyName, 20, 25)
    doc.setFontSize(14)
    doc.setTextColor(148, 163, 184)
    doc.text(reportTitle, 20, 35)
    doc.setFontSize(10)
    doc.text(dateStr, doc.internal.pageSize.width - 20, 25, { align: "right" })
    doc.text(timeStr, doc.internal.pageSize.width - 20, 35, { align: "right" })
    let startY = 60
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text("Ringkasan Hari Ini", 20, startY)
    startY += 10
    const cardWidth = 40
    const cardHeight = 25
    const gap = 5
    const startX = 20
    const drawCard = (idx: number, label: string, val: string | number, color: [number, number, number]) => {
      const x = startX + (idx * (cardWidth + gap))
      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(200, 200, 200)
      doc.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, "FD")
      doc.setFontSize(8)
      doc.setTextColor(100)
      doc.text(label, x + 5, startY + 8)
      doc.setFontSize(12)
      doc.setTextColor(color[0], color[1], color[2])
      doc.setFont("helvetica", "bold")
      doc.text(String(val), x + 5, startY + 18)
      doc.setFont("helvetica", "normal")
    }
    drawCard(0, "Total Karyawan", totalEmployeesCount, [59, 130, 246])
    drawCard(1, "Hadir", presentCount, [16, 185, 129])
    drawCard(2, "Tidak Hadir", absentCount, [244, 63, 94])
    drawCard(3, "Rata-rata Telat", `${avgLateMins}m`, [245, 158, 11])
    const tableData = presentList.map((row: any) => [
      row.name,
      row.division,
      row.inTime || "-",
      row.lateMinutes ? `${row.lateMinutes} mnt` : "Tepat Waktu",
      row.note || "-"
    ])
    autoTable(doc, {
      startY: startY + 40,
      head: [["Nama", "Divisi", "Jam Masuk", "Keterlambatan", "Catatan"]],
      body: tableData,
      theme: "grid",
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didDrawPage: (data) => {
        const pageCount = doc.getNumberOfPages()
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(`Page ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10)
      }
    })
    doc.save(`Dashboard_Report_${today}.pdf`)
  }

  return (
    <motion.main
      className="space-y-8 pb-10 max-w-6xl mx-auto px-2"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            Admin <span className="text-blue-500">Dashboard</span>
          </h1>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Ringkasan Aktivitas & Statistik</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-2xl">
             <ClockDisplay />
          </div>
          <Button onClick={handleExportDashboardPDF} className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-6 h-11 font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
            <FileText className="size-4 mr-2" />
            PDF Report
          </Button>
        </div>
      </div>

      {/* Pending Approvals Alert */}
      {(dashData?.pendingOvertimeCount > 0 || dashData?.pendingLeaveCount > 0) && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-1 rounded-[2rem] bg-gradient-to-r from-rose-500/20 via-amber-500/10 to-transparent border border-rose-500/20 backdrop-blur-md"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-4">
              <div className="size-12 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/40 animate-pulse">
                <AlertCircle className="size-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Persetujuan Menunggu</h3>
                <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest mt-0.5">
                  Terdapat {dashData.pendingOvertimeCount} lemburan & {dashData.pendingLeaveCount} izin baru
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {dashData.pendingOvertimeCount > 0 && (
                <Button 
                  onClick={() => router.push('/admin/approvals')}
                  size="sm" 
                  className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-[10px] h-9 px-4 uppercase tracking-widest"
                >
                  Proses Lembur
                </Button>
              )}
              {dashData.pendingLeaveCount > 0 && (
                <Button 
                  onClick={() => router.push('/admin/leave')}
                  size="sm" 
                  className="flex-1 sm:flex-none bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-[10px] h-9 px-4 uppercase tracking-widest"
                >
                  Proses Izin
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Karyawan"
          value={totalEmployeesCount}
          icon={Users}
          trend="+2%"
          color="bg-blue-600"
          subtext="Total Aktif"
          onClick={() => router.push('/admin/employees')}
        />
        <StatCard
          title="Hadir"
          value={presentCount}
          icon={UserCheck}
          trend="+4%"
          color="bg-emerald-600"
          subtext="Hari Ini"
          onClick={() => setModalType('present')}
        />
        <StatCard
          title="Absen"
          value={absentCount}
          icon={UserX}
          trend="-1%"
          color="bg-rose-600"
          subtext="Tanpa Ket."
          onClick={() => setModalType('absent')}
        />
        <StatCard
          title="Telat"
          value={`${avgLateMins}m`}
          icon={Clock}
          trend="+0.8%"
          color="bg-amber-600"
          subtext="Rata-rata"
          onClick={() => setModalType('late')}
        />
      </section>

      {/* Analytics Main Grid */}
      <section className="grid gap-6 lg:grid-cols-12">
        {/* Attendance Main Chart */}
        <motion.div variants={containerVariants} className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-xl backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 size-40 bg-blue-500/5 blur-3xl rounded-full" />
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <Activity className="size-4 text-blue-500" /> Statistik Kehadiran
                        </h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Histori 6 Bulan Terakhir</p>
                    </div>
                    <select className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase tracking-widest">
                        <option>2026</option>
                        <option>2025</option>
                    </select>
                </div>
                <div className="h-[300px] w-full">
                    <AttendanceChart data={chartData} />
                </div>
            </div>

            {/* Division & Overtime Trends Row */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2.5rem] shadow-xl">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                        <BarChart3 className="size-4 text-blue-400" /> Performa Divisi
                    </h3>
                    <div className="h-[200px]">
                        <DivisionStatsChart data={divisionStats} />
                    </div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2.5rem] shadow-xl">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Zap className="size-4 text-amber-500" /> Tren Lembur
                    </h3>
                    <div className="h-[200px]">
                        <OvertimeTrendChart data={overtimeTrends} />
                    </div>
                </div>
            </div>
        </motion.div>

        {/* Right Sidebar: Status & Recent */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black text-white uppercase tracking-wider">Status Harian</h3>
                    <div className="p-2 bg-slate-800 rounded-xl">
                        <PieChart className="text-blue-500 size-4" />
                    </div>
                </div>
                <div className="h-[250px] w-full flex items-center justify-center">
                    <DailyStatusChart stats={{ totalEmployees: totalEmployeesCount, presentToday: presentCount, lateCount }} />
                </div>
                <div className="mt-6 grid grid-cols-3 gap-2">
                    <div className="p-3 bg-slate-800/40 rounded-2xl text-center">
                       <p className="text-[8px] font-black text-slate-500 uppercase">Hadir</p>
                       <p className="text-xs font-black text-emerald-400 mt-1">{presentCount - lateCount}</p>
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-2xl text-center">
                       <p className="text-[8px] font-black text-slate-500 uppercase">Telat</p>
                       <p className="text-xs font-black text-amber-400 mt-1">{lateCount}</p>
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-2xl text-center">
                       <p className="text-[8px] font-black text-slate-500 uppercase">Absen</p>
                       <p className="text-xs font-black text-rose-400 mt-1">{absentCount}</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2.5rem] shadow-xl backdrop-blur-sm h-full">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Activity className="size-4 text-orange-500" /> Log Aktivitas
                    </h3>
                    <Button onClick={() => router.push('/admin/recap')} variant="ghost" className="text-[9px] font-black text-slate-500 p-0 uppercase tracking-tighter">View All</Button>
                </div>
                <div className="space-y-3">
                    {recentActivity.slice(0, 5).map((item: any, i: number) => (
                        <div key={i} className="bg-slate-800/30 p-3 rounded-xl border border-slate-800/50 flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-white truncate max-w-[120px]">{item.name}</span>
                                <span className="text-[8px] font-mono text-slate-500 uppercaseTracking-widest">{item.time}</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[8px] font-black uppercase text-blue-500 tracking-tighter italic">{item.action}</span>
                                <Badge variant="outline" className={cn(
                                    "text-[7px] h-3 px-1 border-none font-bold uppercase",
                                    item.status === "On Time" ? "text-emerald-500" : "text-amber-500"
                                )}>{item.status}</Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* --- MODALS (Optimized for Mobile) --- */}
      <Dialog open={modalType === 'present'} onOpenChange={() => setModalType(null)}>
        <DialogContent className="w-[95%] max-w-2xl bg-slate-950 border-slate-800 text-white rounded-3xl p-6 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-wider">Hadir ({presentCount})</DialogTitle>
            <DialogDescription className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              Daftar karyawan check-in hari ini.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto mt-4 pr-1 custom-scrollbar">
            <div className="space-y-4">
                {presentList.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                        <div>
                            <p className="text-sm font-bold text-white">{p.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{p.division} • {p.inTime}</p>
                        </div>
                        {(p.lateMinutes || 0) > 0 ? (
                            <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[9px] font-bold">Telat {p.lateMinutes}m</Badge>
                        ) : (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-bold">Tepat Waktu</Badge>
                        )}
                    </div>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modalType === 'absent'} onOpenChange={() => setModalType(null)}>
        <DialogContent className="w-[95%] max-w-xl bg-slate-950 border-slate-800 text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-wider">Tidak Hadir ({absentCount})</DialogTitle>
            <DialogDescription className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              Belum melakukan absensi hari ini.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto mt-4 pr-1 custom-scrollbar">
             <div className="space-y-3">
                {absentList.map((p: any, i: number) => (
                  <div key={i} className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <div>
                        <p className="text-sm font-bold text-white">{p.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">NIK: {p.nik}</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] text-slate-400 border-slate-800">{p.division}</Badge>
                  </div>
                ))}
                {absentList.length === 0 && <p className="text-center py-10 text-slate-600 italic text-sm">Semua karyawan sudah hadir atau sedang libur.</p>}
             </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modalType === 'late'} onOpenChange={() => setModalType(null)}>
        <DialogContent className="w-[95%] max-w-2xl bg-slate-950 border-slate-800 text-white rounded-3xl p-6 text-left">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-wider">Detail Telat</DialogTitle>
            <DialogDescription className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-left">
              Daftar karyawan yang terlambat hari ini.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto mt-4 pr-1 custom-scrollbar">
             <div className="space-y-4">
                {lateList.map((p: any, i: number) => (
                  <div key={i} className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-bold text-white">{p.name}</p>
                        <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] font-black">{p.lateMinutes} MENIT</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                        <Clock className="size-3" /> Masuk: {p.inTime}
                    </div>
                    {p.note && <p className="mt-2 text-[10px] text-slate-400 italic bg-black/20 p-2 rounded-lg">"{p.note}"</p>}
                  </div>
                ))}
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.main>
  )
}
