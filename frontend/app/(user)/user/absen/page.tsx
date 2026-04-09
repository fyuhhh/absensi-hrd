"use client";

import { Button } from "@/components/ui/button";
import {
  useCurrentUser,
  checkIn,
  checkOut,
  useDB,
  useEmployeeMe
} from "@/lib/storage";
import { useEffect, useState } from "react";
import { computeDistanceMeters } from "@/lib/geo";
import { todayYMD } from "@/lib/time";
import { toast } from "sonner";
import { 
  ShieldAlert,
  Info,
  Camera,
  X,
  Smartphone,
  Settings2,
  AlertTriangle
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

const OfficeMap = dynamic(() => import("@/components/OfficeMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900/50 animate-pulse flex items-center justify-center text-slate-500">
      Loading Map...
    </div>
  ),
});

export default function AbsenFullscreenPage() {
  const user = useCurrentUser();
  const { data } = useDB();
  const { employee: currentEmp } = useEmployeeMe();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const office = {
    lat: data?.settings.officeLat ?? -1.273985438554323,
    lng: data?.settings.officeLng ?? 116.85826015112536,
  };
  const radius = data?.settings.radiusMeters ?? 200;

  const emp = data?.employees?.find((e: any) => e.nik === user?.nik);
  const bypassGps = currentEmp?.bypassGps || emp?.bypassGps || (user as any)?.bypassGps;

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          toast.success("Akses lokasi diberikan");
        },
        (err) => {
          console.error(err);
          if (err.code === 1) toast.error("Izin lokasi ditolak oleh Anda/Browser");
          else toast.error("Gagal mendapatkan lokasi");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      toast.error("Browser Anda tidak mendukung lokasi");
    }
  };

  useEffect(() => {
    if (bypassGps) return;
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => console.error(err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [bypassGps]);

  useEffect(() => {
    if (bypassGps) return;
    if (coords && office.lat && office.lng) {
      setDistance(computeDistanceMeters(coords.lat, coords.lng, office.lat, office.lng));
    }
  }, [coords, office.lat, office.lng, bypassGps]);

  const today = todayYMD();
  const todayAttendance = data?.attendance.find((a: any) => {
    if (a.nik !== user?.nik) return false;
    
    // Safely parse date into Asia/Makassar to correctly reverse UTC shifts from the backend if it hasn't restarted
    let aDate = "";
    if (a.date) {
        aDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Makassar", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(a.date));
    }
    return aDate === today;
  });

  const alreadyCheckIn = !!todayAttendance?.inTime || !!todayAttendance?.in_time;
  const alreadyCheckOut = !!todayAttendance?.outTime || !!todayAttendance?.out_time;

  const inTimeStr = todayAttendance?.inTime || todayAttendance?.in_time;
  const outTimeStr = todayAttendance?.outTime || todayAttendance?.out_time;

  const jadwalInRaw = emp?.defaultStart || (user as any)?.defaultStart || data?.settings?.defaultStart || data?.settings?.default_start || "-";
  const jadwalOutRaw = emp?.defaultEnd || (user as any)?.defaultEnd || data?.settings?.defaultEnd || data?.settings?.default_end || "-";
  
  const jadwalIn = jadwalInRaw !== "-" ? jadwalInRaw.substring(0, 5) : "-";
  const jadwalOut = jadwalOutRaw !== "-" ? jadwalOutRaw.substring(0, 5) : "-";

  const canCheck = distance !== null && distance <= radius;

  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const [isSecure, setIsSecure] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSecure(window.isSecureContext);
    }
  }, []);

  // Camera Logic
  const startCamera = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        const video = document.getElementById("camera-video") as HTMLVideoElement;
        if (video) {
            video.srcObject = stream;
            video.play();
        }
    } catch (err) {
        toast.error("Gagal akses kamera");
    }
  };

  const capturePhoto = () => {
    const video = document.getElementById("camera-video") as HTMLVideoElement;
    const canvas = document.createElement("canvas");
    if (video) {
        canvas.width = 480;
        canvas.height = 640;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.6); // Compressed
        setCapturedPhoto(dataUrl);
        
        // Stop camera
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="-mx-4 -mt-4 p-4 md:m-0 md:p-0 h-[calc(100dvh-80px)] md:h-[calc(100vh-48px)] flex flex-col pt-2"
    >
        <div className="flex-1 w-full relative rounded-[2rem] overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-900">
            {isMounted && (
            <OfficeMap
                lat={office.lat}
                lng={office.lng}
                radius={radius}
                userLat={coords?.lat}
                userLng={coords?.lng}
            />
            )}

            {/* Floating Cyberpunk Clock Overlay */}
            <div className="absolute top-4 left-4 right-4 z-10 bg-[#05050A]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-5 shadow-2xl flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-0.5">
                <span className="text-[10px] md:text-xs font-black tracking-widest uppercase">
                    <span className="text-amber-200/90 drop-shadow-[0_0_8px_rgba(253,230,138,0.5)]">
                        {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                    </span>
                    <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] ml-1">
                        {now.getFullYear()}
                    </span>
                </span>
                <span className="text-[10px] md:text-xs font-bold text-slate-500 tracking-wider">GMT+8</span>
            </div>

            <div className="flex items-baseline justify-center font-black my-1 drop-shadow-[0_0_15px_rgba(192,132,252,0.3)]">
                <span className="text-[3.5rem] md:text-7xl tracking-tighter tabular-nums bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 pr-2">
                {now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).replace(/:/g, '.')}
                </span>
            </div>

            <div className="bg-white/5 rounded-full px-5 py-1 text-[10px] md:text-xs font-bold text-slate-300 backdrop-blur-sm border border-white/5 mb-3 tracking-widest">
                Jadwal Kerja Saya {jadwalIn} - {jadwalOut}
            </div>
            
            <div className="flex gap-6 text-[10px] md:text-xs font-bold tracking-widest mt-1">
                <div className="text-slate-300">IN <span className="text-cyan-400">{alreadyCheckIn && inTimeStr ? inTimeStr.substring(0, 5) : "--:--"}</span></div>
                <div className="text-slate-300">OUT <span className="text-fuchsia-400">{alreadyCheckOut && outTimeStr ? outTimeStr.substring(0, 5) : "--:--"}</span></div>
            </div>
            </div>

            {!canCheck && !bypassGps && (
            <div className="absolute bottom-6 left-4 right-4 z-10 bg-rose-500/90 backdrop-blur-md rounded-2xl p-3 text-center text-white text-[11px] md:text-xs font-semibold shadow-lg animate-pulse">
                Anda berada di luar jangkauan area absensi
            </div>
            )}

            {/* Floating Location Request Button (Available if no coords and not bypassed) */}
            {!coords && !bypassGps && (
              <div className="absolute inset-0 z-20 bg-slate-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-8 text-center pointer-events-none">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/90 border border-slate-700 p-6 rounded-[2rem] shadow-2xl backdrop-blur-xl pointer-events-auto max-w-xs"
                >
                  <div className="flex justify-center mb-4">
                    <div className="size-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-pulse">
                      <Smartphone className="size-8 text-cyan-400" />
                    </div>
                  </div>
                  <h3 className="text-sm font-black text-white uppercase mb-2">Akses Lokasi Diperlukan</h3>
                  <p className="text-[10px] text-slate-400 font-bold mb-5 leading-relaxed">
                    Klik tombol di bawah untuk mengaktifkan GPS dan meminta izin dari HP Anda.
                  </p>
                  <Button 
                    onClick={requestLocation}
                    className="w-full h-12 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[10px] tracking-widest rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                  >
                    <ShieldAlert className="size-4 mr-2" /> AKTIFKAN SEKARANG
                  </Button>

                  {!isSecure && (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-left">
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <ShieldAlert className="size-4" /> Solusi Gagal GPS (HTTPS):
                      </p>
                      <ol className="text-[10px] text-slate-400 font-bold space-y-2 list-decimal pl-4">
                        <li>Jalankan <code className="text-cyan-400">npm run dev-https</code> di komputer.</li>
                        <li>Buka <span className="text-white">https://192.168.11.162:3000</span> di HP.</li>
                        <li>Klik <b>Advanced / Lanjutan</b> jika muncul peringatan.</li>
                        <li>Klik <b>Proceed / Lanjutkan ke situs</b>.</li>
                      </ol>
                    </div>
                  )}
                </motion.div>
              </div>
            )}

            {/* Small Re-Sync Button (Always visible on top right) */}
            <div className="absolute top-4 right-4 z-30">
               <Button 
                 size="icon"
                 onClick={requestLocation}
                 className="size-10 rounded-full bg-slate-900/80 border border-slate-700 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all shadow-xl backdrop-blur-md"
               >
                 <Settings2 className="size-5" />
               </Button>
            </div>

            {/* Camera Overlay */}
            <AnimatePresence>
                {showCamera && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4"
                    >
                        {!capturedPhoto ? (
                            <>
                                <video id="camera-video" autoPlay playsInline className="w-full h-full object-cover rounded-[2rem]" />
                                <div className="absolute bottom-10 flex gap-4">
                                    <Button onClick={() => setShowCamera(false)} variant="ghost" className="bg-white/10 text-white rounded-full size-14">
                                        <X />
                                    </Button>
                                    <Button onClick={capturePhoto} className="bg-cyan-500 text-black rounded-full size-20 shadow-[0_0_30px_rgba(34,211,238,0.5)]" title="Ambil Foto">
                                        <Camera className="size-8" />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="relative w-full h-full flex flex-col items-center justify-center gap-6">
                                <img src={capturedPhoto} className="w-full h-3/4 object-cover rounded-[2rem] border-4 border-cyan-500" alt="Capture Preview" />
                                <div className="flex gap-4 w-full px-4">
                                    <Button onClick={() => setCapturedPhoto(null)} variant="outline" className="flex-1 bg-slate-900 border-slate-700 text-white h-14 rounded-2xl">
                                        ULANGI
                                    </Button>
                                    <Button 
                                        onClick={async () => {
                                            setIsSubmitting(true);
                                            try {
                                                await checkIn(undefined, undefined, capturedPhoto);
                                                toast.success("Berhasil Absen Masuk dengan Foto");
                                                setShowCamera(false);
                                                setCapturedPhoto(null);
                                            } catch (err: any) {
                                                toast.error(err.message || "Gagal absen");
                                            } finally {
                                                setIsSubmitting(false);
                                            }
                                        }}
                                        className="flex-1 bg-cyan-500 text-black h-14 rounded-2xl font-black"
                                    >
                                        SIMPAN & KIRIM
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Diagnostic Bar */}
            <div className="absolute bottom-4 left-4 right-4 z-30 flex gap-2 justify-center">
              <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-full px-3 py-1 flex items-center gap-4 shadow-2xl">
                <div className="flex items-center gap-1.5">
                  <div className={`size-1.5 rounded-full ${isSecure ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`} />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{isSecure ? 'HTTPS' : 'HTTP'}</span>
                </div>
                <div className="w-[1px] h-3 bg-slate-800" />
                <div className="flex items-center gap-1.5">
                  <div className={`size-1.5 rounded-full ${coords ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`} />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{coords ? 'GPS OK' : 'GPS LOKAL'}</span>
                </div>
                <div className="w-[1px] h-3 bg-slate-800" />
                <div className="flex items-center gap-1.5">
                  <div className={`size-1.5 rounded-full ${typeof navigator !== 'undefined' && navigator.geolocation ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`} />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">API</span>
                </div>
              </div>
            </div>
        </div>

        {/* Presence Cards */}
        <div className="mt-4 grid grid-cols-2 gap-3 shrink-0">
            {bypassGps ? (
                <Button
                    className="h-20 py-0 relative overflow-hidden group bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-3 shadow-xl rounded-[1.5rem]"
                    disabled={alreadyCheckIn || alreadyCheckOut || isSubmitting}
                    onClick={() => { setShowCamera(true); startCamera(); }}
                >
                    <div className="h-10 w-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-md shadow-inner flex items-center justify-end pr-1 relative">
                        <div className="absolute -right-2 text-yellow-400 text-[10px]">◀</div>
                    </div>
                    <div className="flex flex-col items-start justify-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-0.5">Presence</span>
                        <span className="text-xl font-black text-cyan-400 leading-none tracking-tight">
                            {isSubmitting ? "..." : (alreadyCheckIn && inTimeStr ? inTimeStr.substring(0,5) : "IN")}
                        </span>
                    </div>
                </Button>
            ) : (
                <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                    className="h-20 py-0 relative overflow-hidden group bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-3 shadow-xl rounded-[1.5rem]"
                    disabled={!canCheck || alreadyCheckIn || alreadyCheckOut || isSubmitting}
                    >
                    <div className="h-10 w-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-md shadow-inner flex items-center justify-end pr-1 relative">
                        <div className="absolute -right-2 text-yellow-400 text-[10px]">◀</div>
                    </div>
                    <div className="flex flex-col items-start justify-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-0.5">Presence</span>
                        <span className="text-xl font-black text-cyan-400 leading-none tracking-tight">
                            {isSubmitting ? "..." : (alreadyCheckIn && inTimeStr ? inTimeStr.substring(0,5) : "IN")}
                        </span>
                    </div>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Absen Masuk</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin melakukan absen masuk sekarang?
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={async () => {
                        setIsSubmitting(true);
                        try { await checkIn(); toast.success("Berhasil Absen Masuk"); } 
                        catch (error: any) { toast.error(error.message || "Gagal absen"); }
                        finally { setIsSubmitting(false); }
                    }}>Ya, Absen Masuk</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
            )}

            {bypassGps ? (
                <Button
                    className="h-20 py-0 relative overflow-hidden group bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-3 shadow-xl rounded-[1.5rem]"
                    disabled={!alreadyCheckIn || alreadyCheckOut || isSubmitting}
                    onClick={async () => {
                        setIsSubmitting(true);
                        try { await checkOut(); toast.success("Berhasil Absen Keluar"); } 
                        catch (error: any) { toast.error(error.message || "Gagal absen"); }
                        finally { setIsSubmitting(false); }
                    }}
                >
                    <div className="h-10 w-6 bg-gradient-to-br from-fuchsia-400 to-fuchsia-600 rounded-md shadow-inner flex items-center justify-end pr-1 relative">
                        <div className="absolute -right-2 text-yellow-400 text-[10px]">◀</div>
                    </div>
                    <div className="flex flex-col items-start justify-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-0.5">Presence</span>
                        <span className="text-xl font-black text-fuchsia-400 leading-none tracking-tight">
                            {isSubmitting ? "..." : (alreadyCheckOut && outTimeStr ? outTimeStr.substring(0,5) : "OUT")}
                        </span>
                    </div>
                </Button>
            ) : (
                <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button
                    className="h-20 py-0 relative overflow-hidden group bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-3 shadow-xl rounded-[1.5rem]"
                    disabled={!canCheck || !alreadyCheckIn || alreadyCheckOut || isSubmitting}
                    >
                    <div className="h-10 w-6 bg-gradient-to-br from-fuchsia-400 to-fuchsia-600 rounded-md shadow-inner flex items-center justify-end pr-1 relative">
                        <div className="absolute -right-2 text-yellow-400 text-[10px]">◀</div>
                    </div>
                    <div className="flex flex-col items-start justify-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-0.5">Presence</span>
                        <span className="text-xl font-black text-fuchsia-400 leading-none tracking-tight">
                            {isSubmitting ? "..." : (alreadyCheckOut && outTimeStr ? outTimeStr.substring(0,5) : "OUT")}
                        </span>
                    </div>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Konfirmasi Absen Keluar</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin melakukan absen keluar sekarang? Tidak bisa kembali.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={async () => {
                        setIsSubmitting(true);
                        try { await checkOut(); toast.success("Berhasil Absen Keluar"); } 
                        catch (error: any) { toast.error(error.message || "Gagal absen"); }
                        finally { setIsSubmitting(false); }
                    }}>Ya, Absen Keluar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    </motion.div>
  );
}
