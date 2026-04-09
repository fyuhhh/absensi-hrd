"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type Employee,
  upsertEmployee,
  deleteEmployee,
  useDB,
} from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, Trash2, Edit, User as UserIcon, Building2, Wallet, Clock, Calendar, ShieldCheck, UserX, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function EmployeesPage() {
  const { data } = useDB();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Partial<Employee>>({
    nik: "",
    name: "",
    password: "",
    division: data?.divisions[0]?.name || "",
    transportPerDay: 25000,
    status: "active",
    scheduleType: "fixed",
    defaultStart: "09:00",
    defaultEnd: "15:00",
    periodeStart: "",
    periodeEnd: "",
    bypassGps: false,
  });

  const [visibleCount, setVisibleCount] = useState(8);

  const reset = () =>
    setForm({
      nik: "",
      name: "",
      password: "",
      division: data?.divisions[0]?.name || "",
      transportPerDay: 25000,
      status: "active",
      scheduleType: "fixed",
      defaultStart: "09:00",
      defaultEnd: "15:00",
      periodeStart: "",
      periodeEnd: "",
      bypassGps: false,
    });

  const filteredEmployees = useMemo(() => {
    if (!data?.employees) return [];
    return [...data.employees]
      .filter((e: Employee) => {
        const n = (e.name || "").toLowerCase();
        const k = (e.nik || "").toLowerCase();
        const d = (e.division || "").toLowerCase();
        const s = search.toLowerCase();
        return n.includes(s) || k.includes(s) || d.includes(s);
      })
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [data?.employees, search]);

  const visibleEmployees = filteredEmployees.slice(0, visibleCount);

  return (
    <main className="space-y-6 pb-10 max-w-6xl mx-auto px-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
          Kelola <span className="text-blue-500">Karyawan</span>
        </h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Manajemen Data & Hak Akses</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr] items-start">
        {/* Form Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-slate-900/50 border-slate-800 text-white rounded-[2.5rem] shadow-2xl backdrop-blur-md overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-black uppercase tracking-wider flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <PlusCircle className="size-5 text-blue-500" />
                </div>
                {form.nik ? "Ubah Data" : "Tambah Karyawan"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!form.nik || !form.name || !form.password || !form.division) {
                    toast.error("Mohon lengkapi data wajib (NIK, Nama, Password, Divisi)");
                    return;
                  }
                  
                  try {
                    const res = await upsertEmployee(form as Employee);
                    if (res.ok) {
                      toast.success(form.nik ? "Data berhasil diubah!" : "Karyawan baru ditambahkan!");
                      reset();
                    } else {
                      toast.error("Gagal: " + res.error);
                    }
                  } catch (err: any) {
                    toast.error("Error: " + err.message);
                  }
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">NIK</Label>
                    <Input
                      className="bg-slate-950 border-slate-800 text-white focus:border-blue-500 h-11 rounded-2xl"
                      placeholder="Masukkan NIK..."
                      value={form.nik || ""}
                      onChange={(e) => setForm((f) => ({ ...f, nik: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nama Lengkap</Label>
                    <Input
                      className="bg-slate-950 border-slate-800 text-white focus:border-blue-500 h-11 rounded-2xl"
                      placeholder="Nama lengkap sesuai KTP..."
                      value={form.name || ""}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                   <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</Label>
                    <Input
                      type="password"
                      className="bg-slate-950 border-slate-800 text-white focus:border-blue-500 h-11 rounded-2xl"
                      placeholder="Minimal 6 karakter..."
                      value={form.password || ""}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Divisi</Label>
                    <Select
                      value={form.division || ""}
                      onValueChange={(v) => setForm((f) => ({ ...f, division: v }))}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-white h-11 rounded-2xl">
                        <SelectValue placeholder="Pilih divisi" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        {data?.divisions.map((d: any) => (
                          <SelectItem key={d.name} value={d.name} className="focus:bg-slate-800 focus:text-white">
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Uang Transport (Rp)</Label>
                    <Input
                      type="number"
                      className="bg-slate-950 border-slate-800 text-white focus:border-blue-500 h-11 rounded-2xl"
                      value={form.transportPerDay || 0}
                      onChange={(e) => setForm((f) => ({ ...f, transportPerDay: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Status Akun</Label>
                    <Select
                      value={form.status || "active"}
                      onValueChange={(v) => setForm((f) => ({ ...f, status: v as Employee["status"] }))}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-white h-11 rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="active" className="focus:bg-slate-800 focus:text-white">Aktif</SelectItem>
                        <SelectItem value="inactive" className="focus:bg-slate-800 focus:text-white">Nonaktif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex items-center justify-between">
                     <div className="flex flex-col">
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">Bypass GPS</p>
                        <p className="text-[8px] text-slate-500 font-bold">Absen pakai Foto (Tanpa GPS)</p>
                     </div>
                     <input 
                        type="checkbox" 
                        className="size-5 rounded-lg accent-orange-500"
                        checked={!!form.bypassGps}
                        onChange={(e) => setForm((f) => ({ ...f, bypassGps: e.target.checked }))}
                     />
                </div>

                <div className="space-y-2 text-center py-2 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                   <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Pengaturan Jam Kerja</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tipe Jadwal</Label>
                    <Select
                      value={form.scheduleType || "fixed"}
                      onValueChange={(v) => setForm((f) => ({ ...f, scheduleType: v as Employee["scheduleType"] }))}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-white h-11 rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="fixed" className="focus:bg-slate-800 focus:text-white">Tetap (9-15)</SelectItem>
                        <SelectItem value="flexible" className="focus:bg-slate-800 focus:text-white">Fleksibel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.scheduleType !== "flexible" && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Jam Masuk</Label>
                        <Input
                          type="time"
                          className="bg-slate-950 border-slate-800 text-white focus:border-blue-500 h-11 rounded-2xl"
                          value={form.defaultStart || "09:00"}
                          onChange={(e) => setForm((f) => ({ ...f, defaultStart: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Jam Pulang</Label>
                        <Input
                          type="time"
                          className="bg-slate-950 border-slate-800 text-white focus:border-blue-500 h-11 rounded-2xl"
                          value={form.defaultEnd || "15:00"}
                          onChange={(e) => setForm((f) => ({ ...f, defaultEnd: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-6">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                    {form.nik ? "Simpan Perubahan" : "Terbitkan Akun"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={reset} className="text-slate-500 hover:text-white hover:bg-slate-800 h-12 px-6 rounded-2xl">
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* List Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <div className="size-2 bg-blue-500 rounded-full animate-pulse" />
              Daftar Pegawai
            </h2>
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
              <Input
                placeholder="Cari nama, NIK, atau divisi..."
                className="pl-11 h-11 bg-slate-900/50 border-slate-800 text-xs rounded-2xl focus:border-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {visibleEmployees.map((e: Employee, i: number) => (
                <motion.div
                  key={e.nik}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-slate-900/50 border border-slate-800 p-5 rounded-[2rem] hover:border-slate-700 transition-all group shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                      <UserIcon className="size-20 text-white" />
                  </div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="size-12 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-blue-500 border border-slate-700 group-hover:bg-blue-500/10 transition-colors">
                      {(e.name || "?").charAt(0)}
                    </div>
                    <div className="flex gap-1 box-actions">
                      <Button size="icon" variant="ghost" onClick={() => setForm(e)} className="h-9 w-9 rounded-xl text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={async () => {
                          if (confirm(`Yakin ingin menghapus ${e.name}?`)) {
                            await deleteEmployee(e.nik);
                            toast.success("Karyawan dihapus");
                          }
                        }}
                        className="h-9 w-9 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{e.name || "Tanpa Nama"}</h3>
                      <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-0.5">NIK: {e.nik}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/50 flex flex-col items-center justify-center text-center">
                          <Building2 className="size-3 text-slate-600 mb-1" />
                          <p className="text-[9px] text-white font-bold truncate w-full">{e.division || "-"}</p>
                      </div>
                      <div className="bg-slate-950/50 p-2 rounded-xl border border-slate-800/50 flex flex-col items-center justify-center text-center">
                          <Wallet className="size-3 text-emerald-600 mb-1" />
                          <p className="text-[9px] text-emerald-400 font-bold">Rp {(e.transportPerDay || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {e.status === 'active' ? (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] font-black uppercase tracking-widest py-0">AKTIF</Badge>
                        ) : (
                            <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[8px] font-black uppercase tracking-widest py-0">NONAKTIF</Badge>
                        )}
                        {e.bypassGps && (
                            <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[8px] font-black uppercase tracking-widest py-0">PHOTO ONLY</Badge>
                        )}
                        <Badge variant="outline" className="text-[8px] text-slate-500 border-slate-800 py-0 flex gap-1 items-center">
                            <Clock className="size-2.5" /> {e.scheduleType === 'fixed' ? `${e.defaultStart}-${e.defaultEnd}` : 'FREE'}
                        </Badge>
                    </div>
                    
                    <div className="p-2 bg-slate-950/30 rounded-xl border border-slate-800/20">
                        <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                            <ShieldCheck className="size-2.5" /> Akses Sistem
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono tracking-tighter">{(e as any).plaintextPassword || "********"}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {visibleEmployees.length < filteredEmployees.length && (
              <Button 
                variant="ghost" 
                onClick={() => setVisibleCount(v => v + 8)}
                className="col-span-full h-12 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all"
              >
                Muat Lebih Banyak ({filteredEmployees.length - visibleEmployees.length} lagi)
              </Button>
            )}

            {filteredEmployees.length === 0 && (
              <div className="col-span-full py-20 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-[3rem]">
                <UserX className="size-12 text-slate-800 mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Karyawan tidak ditemukan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
