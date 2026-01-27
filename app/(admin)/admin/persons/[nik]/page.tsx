"use client";

import { useDB } from "@/lib/storage";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ExcelJS from "exceljs";
import dynamic from "next/dynamic";

const OfficeMap = dynamic(() => import("@/components/OfficeMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-500">Loading Map...</div>
});
import { User, FileSpreadsheet, MapPin, Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function PersonDetailPage() {
  const { nik } = useParams() as { nik: string };
  const { data } = useDB();
  const emp = data?.employees.find((e) => e.nik === nik);
  const attendance = (data?.attendance.filter((a) => a.nik === nik) || []).sort(
    (a, b) => b.date.localeCompare(a.date)
  );
  const overtime = (
    data?.overtime.filter((o) => o.nik === nik && o.status === "approved") || // hanya lembur yang sudah disetujui admin
    []
  ).sort((a, b) => b.date.localeCompare(a.date));

  // Gabungkan data attendance dan overtime untuk export
  const exportRows = [
    ...attendance.map((a) => ({
      NIK: emp?.nik || "-",
      Nama: emp?.name || "-",
      Tanggal: a.date,
      In: a.inTime || "-",
      Out: a.outTime || "-",
      Keterangan: a.note || "-",
      "Bukti Foto": "-",
      "Keterangan Absen/Lembur": "Absen",
      _isLembur: false,
    })),
    ...overtime.map((o) => ({
      NIK: emp?.nik || "-",
      Nama: emp?.name || "-",
      Tanggal: o.date,
      In: o.inTime || "-",
      Out: o.outTime || "-",
      Keterangan: o.note || "-",
      "Bukti Foto": "-",
      "Keterangan Absen/Lembur": "Lembur",
      _isLembur: true,
    })),
  ];

  async function handleExportExcel() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Absensi & Lembur");

    // Header
    const columns = [
      { header: "NIK", key: "NIK" },
      { header: "Nama", key: "Nama" },
      { header: "Tanggal", key: "Tanggal" },
      { header: "In", key: "In" },
      { header: "Out", key: "Out" },
      { header: "Keterangan", key: "Keterangan" },
      { header: "Bukti Foto", key: "Bukti Foto" },
      { header: "Keterangan Absen/Lembur", key: "Keterangan Absen/Lembur" },
    ];
    sheet.columns = columns.map((col) => ({
      ...col,
      width: 20,
    }));

    // Data
    exportRows.forEach((row) => {
      const excelRow = sheet.addRow({
        NIK: row.NIK,
        Nama: row.Nama,
        Tanggal: row.Tanggal,
        In: row.In,
        Out: row.Out,
        Keterangan: row.Keterangan,
        "Bukti Foto": "-",
        "Keterangan Absen/Lembur": row["Keterangan Absen/Lembur"],
      });
      // Warnai baris lembur
      if (row._isLembur) {
        excelRow.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFF9C4" },
          };
        });
      }
    });

    // Format header: bold & freeze
    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
    });
    sheet.views = [{ state: "frozen", ySplit: 1 }];

    // Auto width
    sheet.columns.forEach((column) => {
      let maxLength = column.header ? column.header.toString().length : 10;
      column.eachCell?.((cell) => {
        const cellValue = cell.value
          ? typeof cell.value === "object" && "text" in cell.value
            ? (cell.value as any).text
            : cell.value.toString()
          : "";
        if (cellValue.length > maxLength) maxLength = cellValue.length;
      });
      column.width = maxLength + 2;
    });

    // Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Detail_${emp?.nik || "karyawan"}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const office = {
    lat: data?.settings.officeLat ?? -6.2,
    lng: data?.settings.officeLng ?? 106.816666,
  };
  const radius = data?.settings.radiusMeters ?? 200;
  // Ambil lokasi terakhir user dari attendance
  const lastAttendance = attendance[0];
  const userCoords =
    lastAttendance && lastAttendance.lat && lastAttendance.lng
      ? [lastAttendance.lat, lastAttendance.lng]
      : null;
  const officePosition = [office.lat, office.lng];



  return (
    <main className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/admin/persons" className="inline-flex items-center text-sm text-slate-400 hover:text-blue-400 mb-2 transition-colors">
            <ArrowLeft className="size-4 mr-2" />
            Kembali ke Daftar
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Detail Karyawan</h1>
          <p className="text-slate-400">Informasi lengkap profil dan riwayat absensi.</p>
        </div>
        {emp && (
          <Button
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <FileSpreadsheet className="size-4 mr-2" />
            Export Excel
          </Button>
        )}
      </div>

      {emp ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Kolom Kiri: Info & Map */}
          <div className="space-y-6">
            <Card className="bg-[#1E293B] border-slate-800 text-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <User className="size-5 text-blue-500" />
                  Profil Karyawan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Nama Lengkap</span>
                  <span className="text-base font-medium">{emp.name}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">NIK</span>
                  <span className="text-base font-medium font-mono text-slate-300">{emp.nik}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Divisi</span>
                  <span className="text-base font-medium">{emp.division}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Periode Kerja</span>
                  <span className="text-sm font-medium text-slate-300">
                    {emp.periodeStart && emp.periodeEnd
                      ? `${emp.periodeStart} sd ${emp.periodeEnd}`
                      : "-"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Status</span>
                  <div>
                    {emp.status === "active" ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-0">Aktif</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-slate-700 text-slate-400">Nonaktif</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1E293B] border-slate-800 text-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="size-5 text-purple-500" />
                  Lokasi Terakhir
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square w-full rounded-xl overflow-hidden border border-slate-700 relative z-0">
                  {/* @ts-ignore */}
                  {/* Map with lazy loading */}
                  <OfficeMap
                    lat={office.lat}
                    lng={office.lng}
                    radius={radius}
                    userLat={userCoords?.[0]}
                    userLng={userCoords?.[1]}
                  />
                </div>
                <div className="mt-2 text-xs text-slate-500 text-center">
                  * Lokasi berdasarkan check-in terakhir
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kolom Kanan: Riwayat */}
          <div className="lg:col-span-2">
            <Card className="bg-[#1E293B] border-slate-800 text-white h-full">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="size-5 text-orange-500" />
                  Riwayat Absensi & Lembur
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-auto">
                <div className="rounded-lg border border-slate-800 overflow-hidden">
                  <table className="w-full min-w-[600px] text-sm text-left">
                    <thead className="bg-[#0F172A] text-slate-400 font-medium border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Masuk</th>
                        <th className="px-4 py-3">Keluar</th>
                        <th className="px-4 py-3">Keterangan</th>
                        <th className="px-4 py-3">Tipe</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {attendance.map((a, i) => (
                        <tr key={`att-${a.date}-${i}`} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-white">{a.date}</td>
                          <td className="px-4 py-3">{a.inTime || "-"}</td>
                          <td className="px-4 py-3">{a.outTime || "-"}</td>
                          <td className="px-4 py-3 text-slate-400">{a.note || "-"}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="border-slate-600 text-slate-400">Reguler</Badge>
                          </td>
                        </tr>
                      ))}
                      {overtime.map((o, i) => (
                        <tr
                          key={`ot-${o.date}-${i}`}
                          className="bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-yellow-200">{o.date}</td>
                          <td className="px-4 py-3 text-yellow-100">{o.inTime}</td>
                          <td className="px-4 py-3 text-yellow-100">{o.outTime}</td>
                          <td className="px-4 py-3 text-yellow-100/70">{o.note || "-"}</td>
                          <td className="px-4 py-3">
                            <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-0">Lembur</Badge>
                          </td>
                        </tr>
                      ))}
                      {attendance.length === 0 && overtime.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-12 text-center text-slate-500"
                          >
                            Belum ada riwayat absensi
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="bg-[#1E293B] border-slate-800 text-white">
          <CardContent className="py-12 flex flex-col items-center justify-center gap-4 text-center">
            <div className="p-4 bg-slate-800 rounded-full text-slate-500">
              <User className="size-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Karyawan Tidak Ditemukan</h3>
              <p className="text-slate-400">Data karyawan dengan NIK tersebut tidak tersedia di database.</p>
            </div>
            <Link href="/admin/persons">
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                Kembali ke Daftar
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
