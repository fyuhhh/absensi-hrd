"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useDB, saveSettings } from "@/lib/storage";
import { useState } from "react";
import { MapPin, Clock, Save } from "lucide-react";
import dynamic from "next/dynamic";

// Dymanically import the map to avoid window is not defined error during SSR
const OfficeMap = dynamic(() => import("@/components/OfficeMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-500">Loading Map...</div>
});

export default function SettingsPage() {
  const { data } = useDB();
  const [start, setStart] = useState(data?.settings.defaultStart || "09:00");
  const [end, setEnd] = useState(data?.settings.defaultEnd || "15:00");
  const [lat, setLat] = useState(data?.settings.officeLat ?? -6.2);
  const [lng, setLng] = useState(data?.settings.officeLng ?? 106.816666);
  const [radius, setRadius] = useState(data?.settings.radiusMeters ?? 200);

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Pengaturan Sistem</h1>
        <p className="text-slate-400">Konfigurasi jam kerja dan lokasi kantor.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="bg-[#1E293B] border-slate-800 text-white h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="size-5 text-blue-500" />
              Jam Kerja Default
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label className="text-slate-300">Jam Masuk</Label>
                <Input
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white focus:border-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-300">Jam Keluar</Label>
                <Input
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white focus:border-blue-500"
                />
              </div>
            </div>
            <Button
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white"
              onClick={() =>
                saveSettings({ defaultStart: start, defaultEnd: end })
              }
            >
              <Save className="size-4 mr-2" />
              Simpan Pengaturan Jam
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B] border-slate-800 text-white h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="size-5 text-emerald-500" />
              Lokasi Kantor & Radius
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label className="text-slate-300">Latitude</Label>
                <Input
                  type="number"
                  value={lat}
                  onChange={(e) => setLat(Number.parseFloat(e.target.value))}
                  className="bg-slate-950 border-slate-700 text-white focus:border-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-300">Longitude</Label>
                <Input
                  type="number"
                  value={lng}
                  onChange={(e) => setLng(Number.parseFloat(e.target.value))}
                  className="bg-slate-950 border-slate-700 text-white focus:border-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-300">Radius (M)</Label>
                <Input
                  type="number"
                  value={radius}
                  onChange={(e) => setRadius(Number.parseInt(e.target.value))}
                  className="bg-slate-950 border-slate-700 text-white focus:border-blue-500"
                />
              </div>
            </div>

            <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-700 relative z-0">
              {/* Map Container */}
              <OfficeMap lat={lat} lng={lng} radius={radius} />
            </div>

            <Button
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white"
              onClick={() =>
                saveSettings({
                  officeLat: lat,
                  officeLng: lng,
                  radiusMeters: radius,
                })
              }
            >
              <Save className="size-4 mr-2" />
              Simpan Lokasi
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
