"use client";

import { useState, useMemo } from "react";
import { useDB, useSchedules, upsertSchedule, deleteSchedule, Employee } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Search, 
  Trash2, 
  User as UserIcon, 
  PlusCircle,
  AlertCircle,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function SchedulesPage() {
  const { data } = useDB();
  const [selectedNik, setSelectedNik] = useState<string>("");
  const [search, setSearch] = useState("");
  
  const { schedules, mutate } = useSchedules(selectedNik);

  const [isRange, setIsRange] = useState(false);
  const [form, setForm] = useState<{
    date: Date | undefined,
    startDate: Date | undefined,
    endDate: Date | undefined,
    startTime: string,
    endTime: string
  }>({
    date: undefined,
    startDate: undefined,
    endDate: undefined,
    startTime: "09:00",
    endTime: "15:00",
  });

  const selectedEmployee = useMemo(() => {
    return data?.employees.find((e: Employee) => e.nik === selectedNik);
  }, [data?.employees, selectedNik]);

  const filteredEmployees = useMemo(() => {
    if (!data?.employees) return [];
    return data.employees.filter((e: Employee) => 
      e.role !== 'admin' && (
        e.name.toLowerCase().includes(search.toLowerCase()) || 
        e.nik.toLowerCase().includes(search.toLowerCase())
      )
    ).sort((a: Employee, b: Employee) => (a.name || "").localeCompare(b.name || "")).slice(0, 100);
  }, [data?.employees, search]);

  const handleUpsert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNik) {
      toast.error("Pilih karyawan terlebih dahulu");
      return;
    }
    
    if (isRange) {
      if (!form.startDate || !form.endDate) {
        toast.error("Pilih rentang tanggal");
        return;
      }
    } else {
      if (!form.date) {
        toast.error("Pilih tanggal");
        return;
      }
    }

    try {
      const res = await upsertSchedule({
        nik: selectedNik,
        ...(isRange 
            ? { 
                startDate: format(form.startDate!, "yyyy-MM-dd"), 
                endDate: format(form.endDate!, "yyyy-MM-dd") 
              } 
            : { 
                date: format(form.date!, "yyyy-MM-dd") 
              }),
        startTime: form.startTime,
        endTime: form.endTime
      });

      if (res.ok) {
        toast.success(isRange ? "Rentang jadwal berhasil disimpan" : "Jadwal khusus berhasil disimpan");
        mutate();
        setForm(f => ({ ...f, date: undefined, startDate: undefined, endDate: undefined })); // Reset dates
      } else {
        toast.error(res.error);
      }
    } catch (err: any) {
      toast.error("Error: " + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus jadwal khusus ini?")) return;
    try {
      const res = await deleteSchedule(id);
      if (res.ok) {
        toast.success("Jadwal dihapus");
        mutate();
      }
    } catch (err: any) {
      toast.error("Error: " + err.message);
    }
  };

  return (
    <main className="space-y-6 pb-10 max-w-6xl mx-auto px-2">
      <div className="flex flex-col gap-1 text-center md:text-left">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
          Atur <span className="text-fuchsia-500">Jadwal Khusus</span>
        </h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">
          Admin Tanggung Jawab & Administrator
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr] items-start">
        {/* Selection & Form Card */}
        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800 text-white rounded-[2.5rem] shadow-2xl backdrop-blur-md overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-black uppercase tracking-wider flex items-center gap-3 text-fuchsia-500">
                <div className="p-2 bg-fuchsia-500/10 rounded-xl">
                  <UserIcon className="size-5" />
                </div>
                Pilih Karyawan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                <Input
                  placeholder="Cari NIK atau Nama..."
                  className="pl-11 h-12 bg-slate-950 border-slate-800 text-white focus:border-fuchsia-500 rounded-2xl"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredEmployees.map((e: Employee) => (
                  <button
                    key={e.nik}
                    onClick={() => {
                        setSelectedNik(e.nik);
                        setSearch("");
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                      selectedNik === e.nik 
                        ? "bg-fuchsia-600/20 border-fuchsia-500/50 shadow-lg shadow-fuchsia-500/10" 
                        : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`size-10 rounded-xl flex items-center justify-center font-black ${
                          selectedNik === e.nik ? "bg-fuchsia-500 text-white" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
                      }`}>
                        {e.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{e.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono tracking-tighter italic whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">NIK: {e.nik}</p>
                      </div>
                    </div>
                    {selectedNik === e.nik && <Badge className="bg-fuchsia-500 text-white border-none text-[8px] font-black">TERPILIH</Badge>}
                  </button>
                ))}
                {filteredEmployees.length === 0 && search && (
                    <p className="text-center py-4 text-xs text-slate-500 italic">Karyawan tidak ditemukan</p>
                )}
              </div>
            </CardContent>
          </Card>

          {selectedNik && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="bg-slate-900/50 border-slate-800 text-white rounded-[2.5rem] shadow-2xl backdrop-blur-md overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <div className="flex items-center justify-between w-full">
                    <CardTitle className="text-lg font-black uppercase tracking-wider flex items-center gap-3 text-blue-500">
                      <div className="p-2 bg-blue-500/10 rounded-xl">
                        <PlusCircle className="size-5" />
                      </div>
                      Set Jadwal Baru
                    </CardTitle>
                    <button 
                      onClick={() => setIsRange(!isRange)}
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${
                        isRange ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-950 border-slate-800 text-slate-500"
                      }`}
                    >
                      {isRange ? "Mode Rentang" : "Satu Hari"}
                    </button>
                  </div>
                  <p className="text-[9px] text-blue-400/60 font-bold uppercase tracking-widest mt-1 ml-1 px-2 py-1 bg-blue-400/5 rounded-lg border border-blue-400/10 inline-block">
                    {isRange ? "Pilih tanggal mulai & selesai untuk rentang" : "Pilih satu tanggal spesifik"}
                  </p>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                  <form onSubmit={handleUpsert} className="space-y-4">
                    {isRange ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Dari Tanggal</Label>
                           <Popover>
                             <PopoverTrigger asChild>
                               <Button
                                 variant="outline"
                                 className={`w-full justify-start text-left h-12 bg-slate-950 border-slate-800 rounded-2xl pl-4 hover:bg-slate-900 hover:text-white transition-all ${!form.startDate && "text-slate-500"}`}
                               >
                                 <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                                 {form.startDate ? format(form.startDate, "dd/MM/yyyy") : <span>Pilih tanggal</span>}
                                 <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                               </Button>
                             </PopoverTrigger>
                             <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-800 shadow-2xl" align="start">
                               <CalendarUI
                                 mode="single"
                                 selected={form.startDate}
                                 onSelect={(date) => setForm(f => ({ ...f, startDate: date }))}
                                 disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                 initialFocus
                                 className="rounded-2xl"
                               />
                             </PopoverContent>
                           </Popover>
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Sampai Tanggal</Label>
                           <Popover>
                             <PopoverTrigger asChild>
                               <Button
                                 variant="outline"
                                 className={`w-full justify-start text-left h-12 bg-slate-950 border-slate-800 rounded-2xl pl-4 hover:bg-slate-900 hover:text-white transition-all ${!form.endDate && "text-slate-500"}`}
                               >
                                 <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                                 {form.endDate ? format(form.endDate, "dd/MM/yyyy") : <span>Pilih tanggal</span>}
                                 <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                               </Button>
                             </PopoverTrigger>
                             <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-800 shadow-2xl" align="start">
                               <CalendarUI
                                 mode="single"
                                 selected={form.endDate}
                                 onSelect={(date) => setForm(f => ({ ...f, endDate: date }))}
                                 disabled={(date) => date < (form.startDate || new Date(new Date().setHours(0,0,0,0)))}
                                 initialFocus
                                 className="rounded-2xl"
                               />
                             </PopoverContent>
                           </Popover>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Pilih Tanggal</Label>
                         <Popover>
                           <PopoverTrigger asChild>
                             <Button
                               variant="outline"
                               className={`w-full justify-start text-left h-12 bg-slate-950 border-slate-800 rounded-2xl pl-4 hover:bg-slate-900 hover:text-white transition-all ${!form.date && "text-slate-500"}`}
                             >
                               <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                               {form.date ? format(form.date, "dd/MM/yyyy") : <span>Pilih tanggal</span>}
                               <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                             </Button>
                           </PopoverTrigger>
                           <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-800 shadow-2xl" align="start">
                             <CalendarUI
                               mode="single"
                               selected={form.date}
                               onSelect={(date) => setForm(f => ({ ...f, date: date }))}
                               disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                               initialFocus
                               className="rounded-2xl"
                             />
                           </PopoverContent>
                         </Popover>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Jam Masuk</Label>
                        <div className="relative">
                           <Clock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500 pointer-events-none" />
                           <Input
                             type="time"
                             className="bg-slate-950 border-slate-800 text-white focus:border-blue-500 h-12 rounded-2xl pl-11 color-scheme-dark invert-[0.1]"
                             value={form.startTime}
                             onChange={(e) => setForm(f => ({ ...f, startTime: e.target.value }))}
                             required
                           />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Jam Pulang</Label>
                        <div className="relative">
                           <Clock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500 pointer-events-none" />
                           <Input
                             type="time"
                             className="bg-slate-950 border-slate-800 text-white focus:border-blue-500 h-12 rounded-2xl pl-11 color-scheme-dark invert-[0.1]"
                             value={form.endTime}
                             onChange={(e) => setForm(f => ({ ...f, endTime: e.target.value }))}
                             required
                           />
                        </div>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all mt-4">
                      Simpan Jadwal Khusus
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Existing Overrides List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <div className="size-2 bg-fuchsia-500 rounded-full animate-pulse" />
              Jadwal Tersimpan {selectedEmployee && <span className="text-slate-500 normal-case">: {selectedEmployee.name}</span>}
            </h2>
          </div>

          <div className="grid gap-3">
            {!selectedNik ? (
              <div className="py-32 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-[3rem]">
                <UserIcon className="size-12 text-slate-800 mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Pilih karyawan untuk melihat jadwal</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {schedules.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-[3rem]">
                    <Clock className="size-12 text-slate-800 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Tidak ada jadwal khusus diatur</p>
                  </motion.div>
                ) : (
                  schedules.map((s: any, i: number) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group shadow-xl"
                    >
                      <div className="flex items-center gap-6">
                        <div className="size-14 bg-slate-800 rounded-2xl flex flex-col items-center justify-center border border-slate-700 group-hover:bg-blue-500/10 group-hover:border-blue-500/50 transition-all">
                          <span className="text-[10px] font-black text-slate-500 uppercase leading-none mb-1">TGL</span>
                          <span className="text-lg font-black text-white leading-none">{new Date(s.date).getDate()}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                             <CalendarIcon className="size-3 text-fuchsia-500" />
                             <span className="text-sm font-bold text-white uppercase tracking-wider">{new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', weekday: 'long' }).format(new Date(s.date))}</span>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="flex items-center gap-1.5 py-1 px-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                <Clock className="size-3 text-emerald-500" />
                                <span className="text-xs font-mono font-bold text-emerald-400">{s.startTime} - {s.endTime}</span>
                             </div>
                             <Badge variant="outline" className="text-[9px] border-slate-800 text-slate-500 uppercase font-black tracking-widest px-2">OVERRIDE</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => handleDelete(s.id)}
                        className="size-10 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 ml-auto md:ml-0"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            )}
            
            {selectedNik && (
               <div className="mt-8 p-6 bg-blue-500/5 border border-blue-500/10 rounded-[2rem] flex items-start gap-4">
                  <AlertCircle className="size-5 text-blue-500 shrink-0 mt-1" />
                  <div className="space-y-1">
                     <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Informasi</p>
                     <p className="text-[11px] text-slate-400 leading-relaxed italic">
                        Jadwal yang diatur di sini akan menggantikan jadwal default karyawan (saat ini: <b>{selectedEmployee?.defaultStart || '09:00'} - {selectedEmployee?.defaultEnd || '15:00'}</b>) pada tanggal yang dipilih. Jika tidak ada jadwal khusus, sistem akan kembali menggunakan jadwal default admin.
                     </p>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
