"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { approveOvertime, rejectOvertime, useDB } from "@/lib/storage";
import { CheckCircle2, XCircle, FileCheck, Maximize2, X, Clock, Calendar, User, FileText } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ApprovalsPage() {
  const { data } = useDB();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const pending = data?.overtime.filter((o) => o.status === "pending") || [];

  return (
    <main className="space-y-6 pb-20 max-w-5xl mx-auto px-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
          Approval <span className="text-blue-500">Lemburan</span>
        </h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Verifikasi Pengajuan Tambahan Jam Kerja</p>
      </div>

      <div className="flex items-center gap-3 px-2 mb-2">
          <div className="size-2 bg-blue-500 rounded-full animate-pulse" />
          <h2 className="text-xs font-black text-white uppercase tracking-widest">
            Menunggu Persetujuan ({pending.length})
          </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {pending.map((o, i) => {
            const emp = data?.employees.find((e) => e.nik === o.nik);
            return (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2.5rem] shadow-2xl backdrop-blur-md relative overflow-hidden group"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <FileCheck className="size-24 text-white" />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center font-black text-blue-500">
                             {emp?.name?.charAt(0) || <User className="size-4" />}
                        </div>
                        <div>
                             <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase">{emp?.name || "Karyawan"}</p>
                             <p className="text-[10px] text-slate-500 font-mono tracking-widest">{o.nik}</p>
                        </div>
                    </div>
                    {o.photo && (
                        <div 
                           className="relative size-12 rounded-xl overflow-hidden cursor-zoom-in border border-slate-700 bg-slate-800 shadow-xl group/img hover:border-blue-500 transition-all rotate-3 hover:rotate-0"
                           onClick={() => setSelectedPhoto(o.photo)}
                        >
                           <img src={o.photo} alt="Bukti" className="size-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                               <Maximize2 className="size-4 text-white" />
                           </div>
                        </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                     <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50 flex flex-col items-center">
                        <Calendar className="size-3 text-slate-600 mb-1" />
                        <p className="text-[10px] text-white font-bold">{o.date}</p>
                     </div>
                     <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50 flex flex-col items-center">
                        <Clock className="size-3 text-blue-500 mb-1" />
                        <p className="text-[10px] text-white font-bold">{o.inTime} - {o.outTime}</p>
                     </div>
                  </div>

                  <div className="flex-1 mb-6">
                      <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1 flex items-center gap-1">
                          <FileText className="size-2.5" /> Alasan/Keterangan
                      </p>
                      <div className="bg-black/20 p-3 rounded-2xl border border-slate-800/30">
                          <p className="text-[11px] text-slate-400 italic leading-relaxed">
                            {o.note ? `"${o.note}"` : "Tidak ada keterangan."}
                          </p>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl h-11 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                      onClick={async () => {
                        await approveOvertime(o.id);
                        toast.success(`Lembur ${emp?.name} disetujui`);
                      }}
                    >
                      <CheckCircle2 className="size-4 mr-2" />
                      Setuju
                    </Button>
                    <Button
                      variant="destructive"
                      className="bg-rose-600 hover:bg-rose-500 font-bold rounded-2xl h-11 shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                      onClick={async () => {
                        await rejectOvertime(o.id);
                        toast.error(`Lembur ${emp?.name} ditolak`);
                      }}
                    >
                      <XCircle className="size-4 mr-2" />
                      Tolak
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {pending.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 bg-slate-900/20 border border-dashed border-slate-800 rounded-[3rem]"
          >
            <div className="size-16 bg-emerald-500/5 rounded-full flex items-center justify-center mb-4 border border-emerald-500/10">
                <CheckCircle2 className="size-8 text-emerald-500/20" />
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Semua pengajuan telah diproses</p>
          </motion.div>
      )}

      {/* Standardized Zoom Modal */}
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
                      <img src={selectedPhoto} alt="Zoom Bukti" className="w-full h-auto rounded-[2rem] shadow-2xl border-4 border-slate-800" />
                      <Button 
                          className="absolute -top-4 -right-4 rounded-full size-10 bg-white text-black hover:bg-blue-500 hover:text-white shadow-xl"
                          onClick={() => setSelectedPhoto(null)}
                      >
                          <X className="size-5" />
                      </Button>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>
    </main>
  );
}
