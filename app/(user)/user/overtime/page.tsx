"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { submitOvertime, useCurrentUser, useDB } from "@/lib/storage";
import { Textarea } from "@/components/ui/textarea";

export default function OvertimePage() {
  const user = useCurrentUser();
  const { data } = useDB();
  const [date, setDate] = useState("");
  const [inTime, setInTime] = useState("18:00");
  const [outTime, setOutTime] = useState("21:00");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  const onFile = async (f: File) => {
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(f);
  };

  return (
    <main className="space-y-6">
      <h1 className="text-xl md:text-2xl font-semibold">Pengajuan Lemburan</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Form Pengajuan</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!user) return;
              submitOvertime({ date, inTime, outTime, note, photo });
              setDate("");
              setNote("");
              setPhoto(null);
            }}
          >
            <div className="grid gap-2">
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Jam Lembur In</Label>
              <Input
                type="time"
                value={inTime}
                onChange={(e) => setInTime(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Jam Lembur Out</Label>
              <Input
                type="time"
                value={outTime}
                onChange={(e) => setOutTime(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label>Keterangan</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Opsional"
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label>Upload Bukti Foto</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFile(f);
                }}
              />
              {photo && (
                <img
                  src={photo || "/placeholder.svg"}
                  alt="Bukti foto lembur"
                  className="mt-2 h-40 w-auto rounded-md border object-cover"
                />
              )}
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Kirim Pengajuan</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Riwayat Pengajuan</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2">Tanggal</th>
                <th>In</th>
                <th>Out</th>
                <th>Bukti Foto</th>
                <th>Keterangan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.overtime
                .filter((o) => o.nik === user?.nik)
                .map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="py-2">{o.date}</td>
                    <td>{o.inTime}</td>
                    <td>{o.outTime}</td>
                    <td>
                      {o.photo ? (
                        <a
                          href={o.photo}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={o.photo}
                            alt="Bukti foto lembur"
                            className="w-16 h-16 object-cover rounded"
                          />
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{o.note || "-"}</td>
                    <td className="capitalize">{o.status}</td>
                  </tr>
                ))}
              {(!data ||
                data.overtime.filter((o) => o.nik === user?.nik).length ===
                  0) && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground"
                  >
                    Belum ada pengajuan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </main>
  );
}
