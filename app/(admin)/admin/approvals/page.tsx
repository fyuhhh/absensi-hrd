"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { approveOvertime, rejectOvertime, useDB } from "@/lib/storage";
import { CheckCircle2, XCircle, FileCheck } from "lucide-react";

export default function ApprovalsPage() {
  const { data } = useDB();

  const pending = data?.overtime.filter((o) => o.status === "pending") || [];

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Approval Lemburan</h1>
        <p className="text-slate-400">Persetujuan pengajuan lembur karyawan.</p>
      </div>

      <Card className="bg-[#1E293B] border-slate-800 text-white min-h-[500px]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileCheck className="size-5 text-blue-500" />
            Daftar Pengajuan Menunggu
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <table className="w-full min-w-[720px] text-sm text-left">
              <thead className="bg-[#0F172A] text-slate-400 font-medium border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">NIK</th>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">In</th>
                  <th className="px-4 py-3">Out</th>
                  <th className="px-4 py-3">Bukti Foto</th>
                  <th className="px-4 py-3">Keterangan</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {pending.map((o) => {
                  const name =
                    data?.employees.find((e) => e.nik === o.nik)?.name || "";
                  return (
                    <tr key={o.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{o.nik}</td>
                      <td className="px-4 py-3">{name}</td>
                      <td className="px-4 py-3 text-slate-400">{o.date}</td>
                      <td className="px-4 py-3">{o.inTime}</td>
                      <td className="px-4 py-3">{o.outTime}</td>
                      <td className="px-4 py-3">
                        {o.photo ? (
                          <a
                            href={o.photo}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={o.photo}
                              alt="Bukti"
                              className="w-10 h-10 object-cover rounded border border-slate-700 hover:scale-150 transition-transform origin-center cursor-pointer"
                            />
                          </a>
                        ) : (
                          <span className="text-slate-600 italic">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-400 max-w-[200px] truncate" title={o.note}>
                        {o.note || "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                            onClick={() => approveOvertime(o.id)}
                          >
                            <CheckCircle2 className="size-4 mr-1" />
                            Setuju
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-500"
                            onClick={() => rejectOvertime(o.id)}
                          >
                            <XCircle className="size-4 mr-1" />
                            Tolak
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {pending.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-slate-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="size-8 text-emerald-500/20" />
                        <p>Tidak ada pengajuan lembur yang menunggu approval</p>
                      </div>
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
