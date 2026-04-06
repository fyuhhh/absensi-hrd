"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Calendar, Camera, Send, History, ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle, Maximize2 } from "lucide-react";
import { useDB, useCurrentUser, getHeaders, API_URL } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import useSWR from "swr";

export default function LeaveFormPage() {
    const user = useCurrentUser();
    const { data: dbData, mutate: mutateDB } = useDB();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    // Fetch my requests
    const { data: myRes, mutate: mutateMy, isLoading: loadingMy } = useSWR(`${API_URL}/leave/my`, fetcher);
    const myRequests = myRes?.data || [];

    const [formData, setFormData] = useState({
        type: "izin",
        startDate: "",
        endDate: "",
        reason: "",
        photo: ""
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_SIZE = 640;

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
                    setFormData(prev => ({ ...prev, photo: compressedBase64 }));
                };
                img.src = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.startDate || !formData.endDate) {
            return toast.error("Tanggal awal dan akhir harus diisi");
        }

        try {
            const res = await fetch(`${API_URL}/leave/submit`, {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(formData)
            });

            const result = await res.json();
            if (result.ok) {
                toast.success("Pengajuan berhasil dikirim");
                setFormData({ type: "izin", startDate: "", endDate: "", reason: "", photo: "" });
                mutateDB();
                mutateMy();
            } else {
                toast.error(result.error || "Gagal mengirim pengajuan");
            }
        } catch (err) {
            toast.error("Terjadi kesalahan koneksi");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.main
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 pb-24 md:pb-10 max-w-2xl mx-auto"
        >
            <div className="px-2 flex items-center justify-between">
                <div>
                   <Link href="/user/leave" className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-2 uppercase tracking-widest hover:text-cyan-300">
                        <ArrowLeft className="size-3" /> Kembali
                   </Link>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FileText className="text-cyan-400 size-6" />
                        Form Pengajuan
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 backdrop-blur-sm shadow-xl">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Jenis Pengajuan</label>
                    <select 
                        className="w-full bg-slate-800 border-slate-700 text-white rounded-xl h-12 px-4 focus:ring-2 focus:ring-cyan-500 transition-all outline-none"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                        <option value="izin">Izin</option>
                        <option value="sakit">Sakit</option>
                        <option value="cuti">Cuti</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Mulai</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <Input 
                                type="date" 
                                className="pl-11 h-12 bg-slate-800 border-slate-700 rounded-xl focus:ring-cyan-500" 
                                value={formData.startDate}
                                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Sampai</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                            <Input 
                                type="date" 
                                className="pl-11 h-12 bg-slate-800 border-slate-700 rounded-xl focus:ring-cyan-500" 
                                value={formData.endDate}
                                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Alasan</label>
                    <Textarea 
                        placeholder="Berikan alasan yang jelas..."
                        className="bg-slate-800 border-slate-700 rounded-xl min-h-[100px] focus:ring-cyan-500"
                        value={formData.reason}
                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Bukti Foto</label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-2xl p-6 hover:border-cyan-500/50 transition-all cursor-pointer relative bg-slate-800/30 overflow-hidden">
                        {formData.photo ? (
                            <img src={formData.photo} alt="Bukti" className="h-32 w-full object-contain rounded-lg mb-2" />
                        ) : (
                            <Camera className="size-8 text-slate-500 mb-2" />
                        )}
                        <p className="text-[10px] text-slate-500 mb-2">JPG, PNG maksimal 2MB</p>
                        <Input 
                            type="file" 
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                        />
                        <Button type="button" variant="ghost" size="sm" className="text-cyan-400">Pilih Foto</Button>
                    </div>
                </div>

                <Button 
                    type="submit" 
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 font-bold text-lg shadow-lg shadow-cyan-500/20"
                    disabled={isSubmitting}
                >
                    <Send className="mr-2 size-5" />
                    {isSubmitting ? "Mengirim..." : "Kirim Pengajuan"}
                </Button>
            </form>

            {/* History Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <History className="size-5 text-indigo-400" />
                    </div>
                    <h2 className="text-lg font-bold text-white uppercase tracking-wider">Riwayat Pengajuan</h2>
                </div>

                <div className="space-y-3">
                    {loadingMy ? (
                        <div className="p-10 text-center text-slate-500 italic text-sm">Memuat riwayat...</div>
                    ) : myRequests?.length === 0 ? (
                        <div className="p-10 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl text-slate-500 italic text-sm">
                            Belum ada riwayat pengajuan.
                        </div>
                    ) : myRequests?.map((req: any) => (
                        <motion.div 
                            key={req.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 group hover:border-slate-700 transition-all shadow-lg"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className={`capitalize px-2 py-0 rounded-full text-[9px] border-slate-800 font-bold ${
                                        req.type === 'sakit' ? 'text-rose-400 bg-rose-400/5' : 
                                        req.type === 'cuti' ? 'text-indigo-400 bg-indigo-400/5' : 
                                        'text-cyan-400 bg-cyan-400/5'
                                    }`}>
                                        {req.type}
                                    </Badge>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                        {new Date(req.created_at).toLocaleDateString('id-ID')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
                                    <Calendar className="size-3 text-slate-400" />
                                    {new Date(req.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} 
                                    <span className="text-slate-600 font-normal">→</span>
                                    {new Date(req.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                </div>
                                <p className="text-[10px] text-slate-400 line-clamp-1 italic mb-2">"{req.reason || "-"}"</p>
                                <div>
                                    {req.status === 'approved' ? (
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                            <CheckCircle2 className="size-3" /> DISETUJUI
                                        </div>
                                    ) : req.status === 'rejected' ? (
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 uppercase tracking-widest">
                                            <XCircle className="size-3" /> DITOLAK
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                                            <AlertCircle className="size-3" /> PENDING
                                        </div>
                                    )}
                                </div>
                            </div>

                            {req.photo && (
                                <div 
                                    className="relative size-16 rounded-xl overflow-hidden cursor-zoom-in border border-slate-700 bg-slate-800 shadow-xl shrink-0"
                                    onClick={() => setSelectedPhoto(req.photo)}
                                >
                                    <img src={req.photo} alt="Bukti" className="size-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Maximize2 className="size-3 text-white" />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Photo Zoom Modal */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 backdrop-blur-xl"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 20 }}
                            className="relative max-w-lg w-full"
                            onClick={e => e.stopPropagation()}
                        >
                            <img src={selectedPhoto} alt="Zoom Bukti" className="w-full h-auto rounded-[2rem] shadow-2xl border border-slate-700" />
                            <Button 
                                className="absolute -top-4 -right-4 rounded-full size-10 bg-white text-black hover:bg-rose-500 hover:text-white"
                                onClick={() => setSelectedPhoto(null)}
                            >
                                <XCircle className="size-5" />
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.main>
    );
}

// Fetcher for SWR
const fetcher = (url: string) => fetch(url, { headers: getHeaders() }).then(res => res.json());

