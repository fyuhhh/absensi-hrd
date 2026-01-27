"use client"

import { motion } from "framer-motion"

import { useTodayStats } from "@/lib/storage"
import { Users, UserCheck, UserX, Clock, ArrowUpRight, TrendingUp, MoreHorizontal } from "lucide-react"
import { ClockDisplay } from "@/components/clock"
import { Button } from "@/components/ui/button"
import { AttendanceChart, DailyStatusChart } from "@/components/AdminCharts"
import { ModernCard } from "@/components/ui/modern-card"

const data = [
  { name: 'Jan', total: 40, present: 35 },
  { name: 'Feb', total: 42, present: 38 },
  { name: 'Mar', total: 45, present: 40 },
  { name: 'Apr', total: 45, present: 42 },
  { name: 'May', total: 48, present: 45 },
  { name: 'Jun', total: 50, present: 48 },
  { name: 'Jul', total: 52, present: 50 },
]

const recentActivity = [
  { name: "Budi Santoso", action: "Check In", time: "08:00 AM", status: "On Time" },
  { name: "Siti Rahma", action: "Check In", time: "08:15 AM", status: "Late" },
  { name: "Ahmad Rizky", action: "Overtime Request", time: "09:30 AM", status: "Pending" },
  { name: "Dewi Putri", action: "Check Out", time: "17:00 PM", status: "On Time" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const StatCard = ({ title, value, icon: Icon, trend, color, subtext }: any) => (
  <ModernCard className="group relative overflow-hidden">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
      <Icon className="size-24" />
    </div>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-20 text-white shadow-lg shadow-black/20`}>
        <Icon className="size-6" />
      </div>
      <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
        <TrendingUp className="size-3" />
        {trend}
      </div>
    </div>
    <div className="relative z-10">
      <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</p>
      <p className="text-xs text-slate-500">{subtext}</p>
    </div>
  </ModernCard>
)

export default function AdminDashboardPage() {
  const stats = useTodayStats()

  return (
    <motion.main
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={containerVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Selamat Datang, Admin</h1>
          <p className="text-slate-400 mt-1">Berikut adalah ringkasan aktivitas hari ini.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-1">
            <ClockDisplay />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
            <ArrowUpRight className="size-4 mr-2" />
            Export Data
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Karyawan"
          value={stats.totalEmployees}
          icon={Users}
          trend="+2.5%"
          color="bg-blue-500"
          subtext="Total karyawan aktif"
        />
        <StatCard
          title="Hadir Hari Ini"
          value={stats.presentToday}
          icon={UserCheck}
          trend="+4.3%"
          color="bg-emerald-500"
          subtext="Karyawan check-in"
        />
        <StatCard
          title="Tidak Hadir"
          value={Math.max(stats.totalEmployees - stats.presentToday, 0)}
          icon={UserX}
          trend="-1.2%"
          color="bg-rose-500"
          subtext="Belum check-in / alfa"
        />
        <StatCard
          title="Rata-rata Telat"
          value={`${stats.avgLateMins} mnt`}
          icon={Clock}
          trend="+0.8%"
          color="bg-amber-500"
          subtext="Waktu keterlambatan"
        />
      </section>

      {/* Charts Section */}
      <section className="grid gap-6 lg:grid-cols-3">
        <ModernCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Statistik Kehadiran</h3>
            <select className="bg-slate-950/50 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-1 outline-none focus:ring-1 focus:ring-blue-500">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <AttendanceChart data={data} />
          </div>
        </ModernCard>

        <ModernCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Status Harian</h3>
            <MoreHorizontal className="text-slate-500 size-5 cursor-pointer hover:text-white transition-colors" />
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            <DailyStatusChart stats={stats} />
          </div>
        </ModernCard>
      </section>

      {/* Recent Activity Table */}
      <ModernCard className="p-0 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h3 className="text-lg font-semibold text-white">Aktivitas Terkini</h3>
          <Button variant="ghost" className="text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">View All</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/30 uppercase font-medium text-xs text-slate-500">
              <tr>
                <th className="px-6 py-4">Nama Karyawan</th>
                <th className="px-6 py-4">Aktivitas</th>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentActivity.map((item, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-medium text-white group-hover:text-blue-200 transition-colors">{item.name}</td>
                  <td className="px-6 py-4">{item.action}</td>
                  <td className="px-6 py-4 text-slate-500">{item.time}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${item.status === "On Time" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      item.status === "Late" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ModernCard>
    </motion.main>
  )
}
