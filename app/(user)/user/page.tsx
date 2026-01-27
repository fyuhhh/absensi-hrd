"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClockDisplay } from "@/components/clock";
import {
  useCurrentUser,
  checkIn,
  checkOut,
  submitOvertime,
  useDB,
} from "@/lib/storage";
import { useEffect, useMemo, useRef, useState } from "react";
import { computeDistanceMeters } from "@/lib/geo";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import dynamic from "next/dynamic";

const OfficeMap = dynamic(() => import("@/components/OfficeMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-500">Loading Map...</div>
});

export default function UserDashboardPage() {
  const user = useCurrentUser();
  const { data } = useDB();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [distance, setDistance] = useState<number | null>(null);
  const [absenMsg, setAbsenMsg] = useState<string | null>(null);
  const absenMsgTimeout = useRef<NodeJS.Timeout | null>(null);
  const office = {
    lat: data?.settings.officeLat ?? -6.2,
    lng: data?.settings.officeLng ?? 106.816666,
  };
  const radius = data?.settings.radiusMeters ?? 200;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords(null),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (coords) {
      setDistance(
        computeDistanceMeters(coords.lat, coords.lng, office.lat, office.lng)
      );
    }
  }, [coords, office.lat, office.lng]);

  const todayRows = useMemo(() => {
    if (!user || !data) return [];
    return data.attendance
      .filter((a) => a.nik === user.nik)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 10);
  }, [user, data]);

  const today = new Date().toISOString().slice(0, 10);
  const todayAttendance = data?.attendance.find(
    (a) => a.nik === user?.nik && a.date === today
  );
  const alreadyCheckIn = !!todayAttendance?.inTime;
  const alreadyCheckOut = !!todayAttendance?.outTime;

  const emp = data?.employees.find((e) => e.nik === user?.nik);
  const jadwalIn = emp?.defaultStart || "-";
  const jadwalOut = emp?.defaultEnd || "-";

  const canCheck = distance !== null && distance <= radius;

  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Koordinat kantor dan user
  const officePosition = [office.lat, office.lng];
  const userPosition = coords ? [coords.lat, coords.lng] : null;

  // Custom icons


  return (
    <main className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-wrap">
        <h1 className="text-xl md:text-2xl font-semibold">
          Dashboard Karyawan
        </h1>
        <ClockDisplay />
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Absensi Hari Ini</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col md:flex-row md:justify-between gap-2">
              <div className="text-sm text-muted-foreground">
                Lokasi Anda:{" "}
                {coords
                  ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                  : "Tidak diketahui"}
                <br />
                Jarak ke kantor:{" "}
                {distance !== null
                  ? `${Math.round(distance)} m`
                  : "-"} (radius {radius} m)
              </div>
            </div>
            <div className="w-full flex flex-col items-center mb-2">
              <span className="text-2xl md:text-3xl font-bold text-primary mb-1">
                {now.toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="text-xl md:text-2xl font-bold text-primary mb-2">
                {now.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
              <span className="text-base md:text-lg font-semibold mb-1 text-primary">
                Jadwal Anda Hari Ini Adalah:
              </span>
              <div className="flex flex-col items-center">
                <span className="text-xl md:text-2xl font-bold text-primary">
                  Masuk: {jadwalIn}
                </span>
                <span className="text-xl md:text-2xl font-bold text-primary">
                  Keluar: {jadwalOut}
                </span>
              </div>
            </div>
            <div className="aspect-video w-full rounded-md overflow-hidden border">
              {/* Ganti iframe dengan react-leaflet */}
              {/* Map with lazy loading */}
              <OfficeMap
                lat={office.lat}
                lng={office.lng}
                radius={radius}
                userLat={coords?.lat}
                userLng={coords?.lng}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                disabled={!canCheck || alreadyCheckIn}
                onClick={() => {
                  if (alreadyCheckIn) {
                    setAbsenMsg("Anda sudah absen masuk hari ini.");
                    if (absenMsgTimeout.current)
                      clearTimeout(absenMsgTimeout.current);
                    absenMsgTimeout.current = setTimeout(
                      () => setAbsenMsg(null),
                      3000
                    );
                    return;
                  }
                  checkIn();
                }}
              >
                Absen Masuk
              </Button>
              <Button
                variant="secondary"
                disabled={!canCheck || alreadyCheckOut}
                onClick={() => {
                  if (alreadyCheckOut) {
                    setAbsenMsg("Anda sudah absen keluar hari ini.");
                    if (absenMsgTimeout.current)
                      clearTimeout(absenMsgTimeout.current);
                    absenMsgTimeout.current = setTimeout(
                      () => setAbsenMsg(null),
                      3000
                    );
                    return;
                  }
                  checkOut();
                }}
              >
                Absen Keluar
              </Button>
            </div>
            {!canCheck && (
              <p className="text-sm text-destructive">
                Anda berada di luar radius kantor untuk absen.
              </p>
            )}
            {absenMsg && (
              <p className="text-base text-destructive font-semibold">
                {absenMsg}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Riwayat Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="text-left">
                  <th className="py-2">Tanggal</th>
                  <th>In</th>
                  <th>Out</th>
                  <th>Total Jam</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {todayRows.map((r, i) => (
                  <tr key={`${r.date}-${i}`} className="border-t">
                    <td className="py-2">{r.date}</td>
                    <td>{r.inTime || "-"}</td>
                    <td>{r.outTime || "-"}</td>
                    <td>{r.totalHours?.toFixed(2) ?? "-"}</td>
                    <td>{r.note || "-"}</td>
                  </tr>
                ))}
                {todayRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-muted-foreground"
                    >
                      Belum ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
