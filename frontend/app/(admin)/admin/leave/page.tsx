"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, Maximize2, FileText, Calendar, User, Search, AlertCircle, Info, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/storage";

export default function AdminLeaveManagementPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    const fetchRequests = async () => {
        try {
            const res = await fetch(`${API_URL}/leave/all`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("attendance-session-token")}` }
            });
            const result = await res.json();
            if (result.ok) setRequests(result.data);
        } catch (err) {
            toast.error("Gagal mengambil data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const filteredRequests = useMemo(() => {
        return requests.filter(r => 
            r.employee_name?.toLowerCase().includes(search.toLowerCase()) ||
            r.nik?.toLowerCase().includes(search.toLowerCase()) ||
            r.type?.toLowerCase().includes(search.toLowerCase()) ||
            r.status?.toLowerCase().includes(search.toLowerCase())
        );
    }, [requests, search]);

    const updateStatus = async (id: number, status: string) => {
        try {
            const res = await fetch(`${API_URL}/leave/update-status`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("attendance-session-token")}` 
                },
                body: JSON.stringify({ id, status })
            });
            const result = await res.json();
            if (result.ok) {
                toast.success(`Berhasil ${status === 'approved' ? 'menyetujui' : 'menolak'} pengajuan`);
                fetchRequests();
            }
        } catch (err) {
            toast.error("Gagal memperbarui status");
        }
    };

    return (
        <main className="space-y-6 pb-20 max-w-5xl mx-auto px-2">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                    Manajemen <span className="text-cyan-400">Izin & Sakit</span>
                </h1>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Persetujuan Ketidakhadiran Pegawai</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-2">
                <div className="flex items-center gap-3 w-full">
                    <div className="size-2 bg-cyan-400 rounded-full animate-pulse" />
                    <h2 className="text-xs font-black text-white uppercase tracking-widest shrink-0">
                        Total {requests.length} Pengajuan
                    </h2>
                </div>
                <div className="relative w-full md:w-[350px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                    <Input 
                        placeholder="Cari nama, NIK, tipe..." 
                        className="pl-11 h-11 bg-slate-900/50 border-slate-800 text-xs rounded-2xl focus:border-cyan-500 transition-all font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Filter className="size-3 text-slate-600" />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                           <div key={i} className="h-48 bg-slate-900/30 border border-slate-800 rounded-[2.5rem] animate-pulse" />
                        ))
                    ) : filteredRequests.length === 0 ? (
                        <div className="col-span-full py-24 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem]">
                            <Info className="size-12 text-slate-800 mx-auto mb-4" />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Tidak ada pengajuan ditemukan</p>
                        </div>
                    ) : filteredRequests.map((req, i) => (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-slate-930/50 border border-slate-800 p-6 rounded-[2.5rem] shadow-2xl backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition-all"
                        >
                            <div className="absolute -right-4 -bottom-4 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <FileText className="size-24 text-white" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="size-12 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 font-black text-cyan-400 group-hover:bg-cyan-400/10 transition-colors">
                                            {req.employee_name?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{req.employee_name || "Unknown"}</p>
                                            <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">{req.nik}</p>
                                        </div>
                                    </div>
                                    <Badge className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-current/20 shadow-lg ${
                                        req.type === 'sakit' ? 'bg-rose-500/10 text-rose-500' : 
                                        req.type === 'cuti' ? 'bg-indigo-500/10 text-indigo-500' : 
                                        'bg-cyan-500/10 text-cyan-500'
                                    }`}>
                                        {req.type}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50 flex flex-col items-center justify-center">
                                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1 font-mono">MULAI</p>
                                        <p className="text-[11px] text-white font-black">{new Date(req.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50 flex flex-col items-center justify-center">
                                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1 font-mono">SELESAI</p>
                                        <p className="text-[11px] text-white font-black">{new Date(req.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 mb-6 items-start">
                                    {req.photo && (
                                        <div 
                                            className="relative size-16 shrink-0 rounded-2xl overflow-hidden cursor-zoom-in border border-slate-700 bg-slate-800 shadow-xl group/img hover:border-cyan-400 transition-all rotate-2 hover:rotate-0"
                                            onClick={() => setSelectedPhoto(req.photo)}
                                        >
                                            <img src={req.photo} alt="Bukti" className="size-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                                                <Maximize2 className="size-4 text-white" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex flex-col flex-1">
                                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <AlertCircle className="size-2.5" /> Alasannya
                                        </p>
                                        <div className="bg-black/20 p-2.5 rounded-xl border border-slate-800/30 min-h-[50px]">
                                            <p className="text-[10px] text-slate-400 italic leading-snug">
                                               {req.reason ? `"${req.reason}"` : "Tidak ada keterangan."}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between">
                                    <Badge className={`px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-[0.15em] ${
                                        req.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                                        req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                                        'bg-rose-500/10 text-rose-500 border-rose-500/30'
                                    }`}>
                                        {req.status}
                                    </Badge>

                                    <div className="flex gap-2">
                                        {req.status === 'pending' ? (
                                            <>
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => updateStatus(req.id, 'approved')} 
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-9 px-4 font-black text-[10px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                                                >
                                                    <Check className="size-3.5 mr-1" /> SETUJU
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost"
                                                    onClick={() => updateStatus(req.id, 'rejected')} 
                                                    className="text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl h-9 px-4 font-black text-[10px]"
                                                >
                                                    <X className="size-3.5 mr-1" /> TOLAK
                                                </Button>
                                            </>
                                        ) : (
                                            <span className="text-[9px] text-slate-600 font-black tracking-widest uppercase italic py-2">Terproses</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Same Photo Zoom Modal */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 20 }}
                            className="relative max-w-4xl w-full flex flex-col items-center gap-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-full bg-slate-950 border border-slate-700/50 rounded-[2.5rem] p-4 shadow-2xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-cyan-500/5" />
                                <img src={selectedPhoto} alt="Bukti Full" className="w-full h-auto max-h-[75vh] object-contain rounded-2xl relative z-10" />
                                <Button 
                                    className="absolute -top-4 -right-4 rounded-full size-12 p-0 bg-white text-black hover:bg-cyan-500 hover:text-white transition-colors shadow-2xl border-4 border-slate-950 z-20" 
                                    onClick={() => setSelectedPhoto(null)}
                                >
                                    <X className="size-6" />
                                </Button>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 px-8 py-2.5 rounded-full shadow-2xl">
                                <p className="text-cyan-400 text-xs font-black tracking-[0.3em] uppercase">Lampiran Dokumen</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}

// Minimal Input helper
function Input({ className, ...props }: any) {
    return <input className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
}
