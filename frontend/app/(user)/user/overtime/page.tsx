"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { submitOvertime, useCurrentUser, useDB, getHeaders, API_URL } from "@/lib/storage";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Upload, Send, FileText, CheckCircle2, XCircle, AlertCircle, Maximize2, ArrowLeft, History, Calendar } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function OvertimePage() {
  const user = useCurrentUser();
  const { data, mutate } = useDB();
  const [date, setDate] = useState("");
  const [inTime, setInTime] = useState("18:00");
  const [outTime, setOutTime] = useState("21:00");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFile = async (f: File) => {
    const reader = new FileReader();
    reader.onload = () => {
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
            setPhoto(compressedBase64);
        };
        img.src = String(reader.result);
    };
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!date) return toast.error("Tanggal harus diisi");

    setIsSubmitting(true);
    try {
        const res = await submitOvertime({ date, inTime, outTime, note, photo });
        if (res.ok) {
            toast.success("Pengajuan lembur berhasil dikirim");
            setDate("");
            setNote("");
            setPhoto(null);
            mutate();
        } else {
            toast.error(res.error || "Gagal mengajukan lembur");
        }
    } catch (err) {
        toast.error("Terjadi kesalahan koneksi");
    } finally {
        setIsSubmitting(false);
    }
  };

  const myOvertime = data?.overtime?.filter((o: any) => o.nik === user?.nik) || [];

  return (
    <motion.main
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 pb-24 md:pb-10 max-w-2xl mx-auto"
    >
      <div className="px-2 flex items-center justify-between">
            <div>
                <Link href="/user/leave" className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-2 uppercase tracking-widest hover:text-blue-300">
                    <ArrowLeft className="size-3" /> Kembali
                </Link>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Clock className="text-blue-400 size-6" />
                    Pengajuan Lembur
                </h1>
            </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800 backdrop-blur-sm shadow-xl">
        <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Tanggal Lembur</Label>
            <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="pl-11 h-12 bg-slate-800 border-slate-700 rounded-xl focus:ring-blue-500"
                />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Mulai</Label>
                <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                        type="time"
                        value={inTime}
                        onChange={(e) => setInTime(e.target.value)}
                        required
                        className="pl-11 h-12 bg-slate-800 border-slate-700 rounded-xl focus:ring-blue-500"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Selesai</Label>
                <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                        type="time"
                        value={outTime}
                        onChange={(e) => setOutTime(e.target.value)}
                        required
                        className="pl-11 h-12 bg-slate-800 border-slate-700 rounded-xl focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>

        <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Keterangan Pekerjaan</Label>
            <Textarea
                placeholder="Apa yang Anda kerjakan selama lembur?"
                className="bg-slate-800 border-slate-700 rounded-xl min-h-[100px] focus:ring-blue-500"
                value={note}
                onChange={(e) => setNote(e.target.value)}
            />
        </div>

        <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Bukti Foto</Label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all cursor-pointer relative bg-slate-800/30 overflow-hidden">
                {photo ? (
                    <img src={photo} alt="Bukti" className="h-32 w-full object-contain rounded-lg mb-2" />
                ) : (
                    <Upload className="size-8 text-slate-500 mb-2" />
                )}
                <p className="text-[10px] text-slate-500 mb-2">JPG, PNG maksimal 2MB</p>
                <Input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onFile(f);
                    }}
                />
                <Button type="button" variant="ghost" size="sm" className="text-blue-400">Pilih Foto</Button>
            </div>
        </div>

        <Button
            type="submit"
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 font-bold text-lg shadow-lg shadow-blue-500/20"
            disabled={isSubmitting}
        >
            <Send className="mr-2 size-5" />
            {isSubmitting ? "Mengirim..." : "Kirim Pengajuan"}
        </Button>
      </form>

      {/* History Section */}
      <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                  <History className="size-5 text-purple-400" />
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Riwayat Lembur</h2>
          </div>

          <div className="space-y-3">
              {myOvertime.length === 0 ? (
                  <div className="p-10 text-center bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl text-slate-500 italic text-sm">
                      Belum ada riwayat lembur.
                  </div>
              ) : myOvertime.map((o: any) => (
                  <motion.div
                      key={o.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 group hover:border-slate-700 transition-all shadow-lg"
                  >
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="px-2 py-0 rounded-full text-[9px] border-slate-800 font-bold text-blue-400 bg-blue-400/5">
                                  LEMBUR
                              </Badge>
                              <span className="text-[10px] text-slate-500 font-mono">{o.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
                              <Clock className="size-3 text-slate-400" />
                              {o.inTime} <span className="text-slate-600 font-normal">→</span> {o.outTime}
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1 italic mb-2">"{o.note || "-"}"</p>
                          <div>
                              {o.status === 'approved' ? (
                                  <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                      <CheckCircle2 className="size-3" /> DISETUJUI
                                  </div>
                              ) : o.status === 'rejected' ? (
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

                      {o.photo && (
                          <div
                              className="relative size-16 rounded-xl overflow-hidden cursor-zoom-in border border-slate-700 bg-slate-800 shadow-xl shrink-0"
                              onClick={() => setSelectedPhoto(o.photo)}
                          >
                              <img src={o.photo} alt="Bukti" className="size-full object-cover" />
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
