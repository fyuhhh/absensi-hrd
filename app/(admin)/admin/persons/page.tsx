"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDB } from "@/lib/storage";
import { User, ChevronRight, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PersonsPage() {
  const { data } = useDB();
  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Detail Perorang</h1>
        <p className="text-slate-400">Lihat riwayat absensi detail per karyawan.</p>
      </div>

      <Card className="bg-[#1E293B] border-slate-800 text-white min-h-[500px]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ClipboardList className="size-5 text-blue-500" />
            Daftar Absensi Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <table className="w-full min-w-[600px] text-sm text-left">
              <thead className="bg-[#0F172A] text-slate-400 font-medium border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">NIK</th>
                  <th className="px-4 py-3">Nama Karyawan</th>
                  <th className="px-4 py-3">Divisi</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data?.employees.map((e) => (
                  <tr key={e.nik} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-4 py-3 font-medium text-white">{e.nik}</td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <div className="p-1 bg-slate-700 rounded-full">
                        <User className="size-4 text-slate-300" />
                      </div>
                      <span className="group-hover:text-blue-400 transition-colors">{e.name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{e.division}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/persons/${e.nik}`}
                      >
                        <Button size="sm" variant="ghost" className="text-blue-400 hover:text-white hover:bg-blue-600">
                          Lihat Detail
                          <ChevronRight className="size-4 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {(!data || data.employees.length === 0) && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-12 text-center text-slate-500"
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
    </main>
  );
}
