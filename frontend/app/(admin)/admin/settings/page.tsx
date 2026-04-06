"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useDB, saveSettings } from "@/lib/storage";
import { useState, useEffect } from "react";
import { MapPin, Clock, Save, Shield, Globe, Navigation, Target } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Dynamically import the map to avoid window is not defined error during SSR
const OfficeMap = dynamic(() => import("@/components/OfficeMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">Inisialisasi Peta...</div>
});

export default function SettingsPage() {
  const { data } = useDB();

  // Use local state for inputs
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radius, setRadius] = useState("");

  // Track mounting to prevent hydration errors
  const [isMounted, setIsMounted] = useState(false);

  // Sync with DB when loaded
  useEffect(() => {
    setIsMounted(true);
    if (data?.settings) {
      if (!start) setStart(data.settings.defaultStart || "09:00");
      if (!end) setEnd(data.settings.defaultEnd || "15:00");
      if (lat === "") setLat(String(data.settings.officeLat ?? -1.273985438554323));
      if (lng === "") setLng(String(data.settings.officeLng ?? 116.85826015112536));
      if (radius === "") setRadius(String(data.settings.radiusMeters ?? 200));
    }
  }, [data, start, end, lat, lng, radius]);

  const handleSaveTime = () => {
    saveSettings({ defaultStart: start, defaultEnd: end });
    toast.success("Pengaturan jam kerja disimpan");
  }

  const handleSaveLocation = () => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radNum = parseInt(radius);

    if (isNaN(latNum) || isNaN(lngNum) || isNaN(radNum)) {
      toast.error("Koordinat atau radius tidak valid");
      return;
    }

    saveSettings({
      officeLat: latNum,
      officeLng: lngNum,
      radiusMeters: radNum,
    });
    toast.success("Lokasi kantor disimpan");
  }

  return (
    <main className="space-y-6 pb-20 max-w-4xl mx-auto px-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
          Pengaturan <span className="text-blue-500">Sistem</span>
        </h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Konfigurasi Parameter Global</p>
      </div>

      <div className="grid gap-6">
        {/* Time Settings Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-slate-900/50 border-slate-800 text-white rounded-[2.5rem] shadow-2xl backdrop-blur-md overflow-hidden relative">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Clock className="size-24 text-white" />
             </div>
             <CardHeader className="p-8 pb-4 relative z-10">
                <CardTitle className="text-lg font-black uppercase tracking-wider flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl">
                        <Clock className="size-5 text-blue-500" />
                    </div>
                    Waktu Kerja Operasional
                </CardTitle>
             </CardHeader>
             <CardContent className="p-8 pt-4 space-y-6 relative z-10">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Jam Masuk Default</Label>
                        <Input
                            type="time"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-white focus:border-blue-500 h-12 rounded-2xl font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Jam Pulang Default</Label>
                        <Input
                            type="time"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-white focus:border-blue-500 h-12 rounded-2xl font-bold"
                        />
                    </div>
                </div>
                <Button
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    onClick={handleSaveTime}
                >
                    <Save className="size-4 mr-2" />
                    Simpan Jadwal Utama
                </Button>
             </CardContent>
          </Card>
        </motion.div>

        {/* Location Settings Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-slate-900/50 border-slate-800 text-white rounded-[2.5rem] shadow-2xl backdrop-blur-md overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Navigation className="size-24 text-white" />
            </div>
            <CardHeader className="p-8 pb-4 relative z-10">
                <CardTitle className="text-lg font-black uppercase tracking-wider flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-xl">
                        <MapPin className="size-5 text-emerald-500" />
                    </div>
                    Geofencing & Lokasi Kantor
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6 relative z-10">
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-1.5">
                            <Globe className="size-3" /> Latitude
                        </Label>
                        <Input
                            type="text"
                            placeholder="-1.273985"
                            value={lat}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val.includes(",")) {
                                    const parts = val.split(",");
                                    if (parts.length >= 2) {
                                        setLat(parts[0].trim());
                                        setLng(parts[1].trim());
                                        return;
                                    }
                                }
                                setLat(val);
                            }}
                            className="bg-slate-950 border-slate-800 text-white focus:border-emerald-500 h-12 rounded-2xl font-mono text-[11px]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-1.5">
                            <Globe className="size-3" /> Longitude
                        </Label>
                        <Input
                            type="text"
                            placeholder="116.858260"
                            value={lng}
                            onChange={(e) => setLng(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-white focus:border-emerald-500 h-12 rounded-2xl font-mono text-[11px]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-1.5">
                            <Target className="size-3" /> Radius (M)
                        </Label>
                        <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="200"
                            value={radius}
                            onChange={(e) => setRadius(e.target.value)}
                            className="bg-slate-950 border-slate-800 text-white focus:border-emerald-500 h-12 rounded-2xl font-bold"
                        />
                    </div>
                </div>

                <div className="aspect-[16/9] w-full rounded-[2rem] overflow-hidden border border-slate-800 relative z-0 shadow-inner bg-slate-950">
                    {/* Map Container */}
                    {isMounted && (
                        <OfficeMap
                            lat={parseFloat(lat) || -1.273985438554323}
                            lng={parseFloat(lng) || 116.85826015112536}
                            radius={parseInt(radius) || 200}
                        />
                    )}
                    <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700/50">
                        <p className="text-[8px] text-emerald-400 font-black uppercase tracking-widest">Live Preview Area</p>
                    </div>
                </div>

                <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-12 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                    onClick={handleSaveLocation}
                >
                    <Save className="size-4 mr-2" />
                    Simpan Parameter Lokasi
                </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Info (Bonus) */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
             <div className="bg-blue-500/5 border border-blue-500/10 rounded-[2rem] p-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="size-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Shield className="size-6 text-blue-500" />
                </div>
                <div className="text-center sm:text-left">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Keamanan Geofencing</h3>
                    <p className="text-[11px] text-slate-500 mt-1">Sistem ini menggunakan algoritma Haversine untuk memvalidasi jarak presisi antara karyawan dan titik pusat kantor.</p>
                </div>
             </div>
        </motion.div>
      </div>
    </main>
  );
}
