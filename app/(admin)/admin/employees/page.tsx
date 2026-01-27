"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type Employee,
  upsertEmployee,
  deleteEmployee,
  useDB,
} from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, Trash2, Edit } from "lucide-react";

export default function EmployeesPage() {
  const { data } = useDB();
  const [form, setForm] = useState<Partial<Employee>>({
    nik: "",
    name: "",
    password: "",
    division: data?.divisions[0]?.name || "",
    transportPerDay: 25000,
    status: "active",
    scheduleType: "fixed",
    defaultStart: "09:00",
    defaultEnd: "15:00",
    periodeStart: "",
    periodeEnd: "",
  });

  const reset = () =>
    setForm({
      nik: "",
      name: "",
      password: "",
      division: data?.divisions[0]?.name || "",
      transportPerDay: 25000,
      status: "active",
      scheduleType: "fixed",
      defaultStart: "09:00",
      defaultEnd: "15:00",
      periodeStart: "",
      periodeEnd: "",
    });

  return (
    <main className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Kelola Akun Karyawan</h1>
          <p className="text-slate-400">Manajemen data pegawai dan absensi.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        <Card className="bg-[#1E293B] border-slate-800 text-white h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <PlusCircle className="size-5 text-blue-500" />
              Form Karyawan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!form.nik || !form.name || !form.password || !form.division)
                  return;
                upsertEmployee(form as Employee);
                reset();
              }}
            >
              <div className="grid gap-2">
                <Label className="text-slate-300">NIK</Label>
                <Input
                  className="bg-slate-950 border-slate-700 text-white focus:border-blue-500"
                  value={form.nik || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nik: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-300">Nama Lengkap</Label>
                <Input
                  className="bg-slate-950 border-slate-700 text-white focus:border-blue-500"
                  value={form.name || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-300">Password</Label>
                <Input
                  type="password"
                  className="bg-slate-950 border-slate-700 text-white focus:border-blue-500"
                  value={form.password || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-300">Divisi</Label>
                <Select
                  value={form.division || ""}
                  onValueChange={(v) => setForm((f) => ({ ...f, division: v }))}
                >
                  <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                    <SelectValue placeholder="Pilih divisi" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-slate-700 text-white">
                    {data?.divisions.map((d) => (
                      <SelectItem key={d.name} value={d.name} className="focus:bg-slate-800 focus:text-white">
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-300">Transport (Rp/hari)</Label>
                <Input
                  type="number"
                  className="bg-slate-950 border-slate-700 text-white focus:border-blue-500"
                  value={form.transportPerDay || 0}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      transportPerDay: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-300">Status</Label>
                <Select
                  value={form.status || "active"}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, status: v as Employee["status"] }))
                  }
                >
                  <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-slate-700 text-white">
                    <SelectItem value="active" className="focus:bg-slate-800 focus:text-white">Aktif</SelectItem>
                    <SelectItem value="inactive" className="focus:bg-slate-800 focus:text-white">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-slate-300">Jenis Jam Kerja</Label>
                <Select
                  value={form.scheduleType || "fixed"}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      scheduleType: v as Employee["scheduleType"],
                    }))
                  }
                >
                  <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E293B] border-slate-700 text-white">
                    <SelectItem value="fixed" className="focus:bg-slate-800 focus:text-white">Tetap</SelectItem>
                    <SelectItem value="flexible" className="focus:bg-slate-800 focus:text-white">Fleksibel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.scheduleType !== "flexible" && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label className="text-slate-300">Masuk</Label>
                    <Input
                      type="time"
                      className="bg-slate-950 border-slate-700 text-white focus:border-blue-500"
                      value={form.defaultStart || "09:00"}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, defaultStart: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-slate-300">Keluar</Label>
                    <Input
                      type="time"
                      className="bg-slate-950 border-slate-700 text-white focus:border-blue-500"
                      value={form.defaultEnd || "15:00"}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, defaultEnd: e.target.value }))
                      }
                    />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label className="text-slate-300">Karier Mulai</Label>
                  <Input
                    type="date"
                    className="bg-slate-950 border-slate-700 text-white focus:border-blue-500"
                    value={form.periodeStart || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, periodeStart: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-slate-300">Selesai</Label>
                  <Input
                    type="date"
                    className="bg-slate-950 border-slate-700 text-white focus:border-blue-500"
                    value={form.periodeEnd || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, periodeEnd: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white">
                  Simpan Data
                </Button>
                <Button type="button" variant="ghost" onClick={reset} className="text-slate-400 hover:text-white hover:bg-slate-800">
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B] border-slate-800 text-white h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Daftar Karyawan</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                <Input
                  placeholder="Cari..."
                  className="pl-9 h-9 w-[200px] bg-slate-950 border-slate-700 text-xs"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-auto">
            <div className="rounded-lg border border-slate-800 overflow-hidden">
              <table className="w-full min-w-[720px] text-sm text-left">
                <thead className="bg-[#0F172A] text-slate-400 font-medium border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">NIK</th>
                    <th className="px-4 py-3">Nama</th>
                    <th className="px-4 py-3">Divisi</th>
                    <th className="px-4 py-3">Periode</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data?.employees.map((e) => (
                    <tr key={e.nik} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{e.nik}</td>
                      <td className="px-4 py-3">{e.name}</td>
                      <td className="px-4 py-3 text-slate-400">{e.division}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {e.periodeStart && e.periodeEnd
                          ? `${e.periodeStart} - ${e.periodeEnd}`
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {e.status === "active" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-0">Aktif</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-slate-700 text-slate-400">Nonaktif</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => setForm(e)} className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteEmployee(e.nik)}
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!data || data.employees.length === 0) && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-slate-500"
                      >
                        Belum ada data karyawan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
