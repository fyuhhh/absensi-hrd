"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { exportAttendanceCSV, useDB, Employee, Attendance, Overtime } from "@/lib/storage";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileSpreadsheet, Filter, FileText } from "lucide-react";

export default function RecapPage() {
  const { data } = useDB();
  const [division, setDivision] = useState<string>("all");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [periode, setPeriode] = useState<string>("all");

  const filtered = useMemo(() => {
    if (!data) return [];
    const fromD = from ? new Date(from) : null;
    const toD = to ? new Date(to) : null;
    return data.attendance.filter((a: Attendance) => {
      const emp = data.employees.find((e: Employee) => e.nik === a.nik);
      if (!emp) return false;
      if (division !== "all" && emp.division !== division) return false;
      if (q && !`${a.nik} ${emp?.name}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      const d = new Date(a.date);
      if (fromD && d < fromD) return false;
      if (toD && d > toD) return false;
      return true;
    });
  }, [data, division, q, from, to]);

  const rows =
    data?.employees.map((emp: Employee) => {
      const totalDays =
        data.attendance.filter((att: Attendance) => att.nik === emp.nik).length ?? 0;

      const overtimeList =
        data.overtime.filter((ot: Overtime) => ot.nik === emp.nik) ?? [];

      let totalOvertimeMinutes = 0;
      overtimeList.forEach((ot: Overtime) => {
        if (ot.inTime && ot.outTime) {
          const inParts = ot.inTime.split(":").map(Number);
          const outParts = ot.outTime.split(":").map(Number);
          const inH = inParts[0] ?? 0;
          const inM = inParts[1] ?? 0;
          const outH = outParts[0] ?? 0;
          const outM = outParts[1] ?? 0;
          const inMinutes = inH * 60 + inM;
          const outMinutes = outH * 60 + outM;
          let diff = outMinutes - inMinutes;
          if (diff > 0) totalOvertimeMinutes += diff;
        }
      });

      const totalOvertimeHours = Math.floor(totalOvertimeMinutes / 60);
      const totalOvertimeRemMinutes = totalOvertimeMinutes % 60;
      const totalOvertimeStr =
        totalOvertimeMinutes > 0
          ? `${totalOvertimeHours} jam ${totalOvertimeRemMinutes} menit`
          : "-";
      return {
        nik: emp.nik,
        name: emp.name || "",
        division: emp.division || "",
        periode:
          emp.periodeStart && emp.periodeEnd
            ? `${emp.periodeStart} s/d ${emp.periodeEnd}`
            : "-",
        jamMagang:
          emp.defaultStart && emp.defaultEnd
            ? `${emp.defaultStart}–${emp.defaultEnd}`
            : "-",
        transport: emp.transportPerDay || 0,
        totalDays,
        totalTransport: emp.transportPerDay * totalDays || 0,
        totalOvertime: totalOvertimeStr,
      };
    }) ?? [];
  
  const sortedRows = [...rows].sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  const periodeOptions = Array.from(
    new Set(
      data?.employees
        .map((e: Employee) =>
          e.periodeStart && e.periodeEnd
            ? `${e.periodeStart} s/d ${e.periodeEnd}`
            : "-"
        )
        .filter((p: string) => p !== "-")
    )
  ) as string[];

  const filteredRows = rows.filter((r: any) => {
    if (periode !== "all" && r.periode !== periode) return false;
    return true;
  });

  async function handleExportExcel() {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Rekap Absensi");

    const columns = [
      { header: "NIK", key: "nik" },
      { header: "Nama", key: "name" },
      { header: "Divisi", key: "division" },
      { header: "Periode", key: "periode" },
      { header: "Jam Magang", key: "jamMagang" },
      { header: "Transport", key: "transport" },
      { header: "Jumlah Hari", key: "totalDays" },
      { header: "Total", key: "totalTransport" },
      { header: "Total Lemburan (Waktu)", key: "totalOvertime" },
    ];
    sheet.columns = columns.map((col) => ({
      ...col,
      width: 20,
    }));

    filteredRows.forEach((row: any) => {
      sheet.addRow({
        nik: row.nik,
        name: row.name,
        division: row.division,
        periode: row.periode,
        jamMagang: row.jamMagang,
        transport: `Rp ${row.transport.toLocaleString("id-ID")}`,
        totalDays: row.totalDays,
        totalTransport: `Rp ${row.totalTransport.toLocaleString("id-ID")}`,
        totalOvertime: row.totalOvertime,
      });
    });

    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
    });
    sheet.views = [{ state: "frozen", ySplit: 1 }];

    sheet.columns.forEach((column) => {
      let maxLength = column.header ? column.header.toString().length : 10;
      column.eachCell?.((cell) => {
        const cellValue = cell.value ? cell.value.toString() : "";
        if (cellValue.length > maxLength) maxLength = cellValue.length;
      });
      column.width = maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Rekap_Absensi.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  }

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    // -- Header Config --
    const companyName = "Absensi HRD System";
    const reportTitle = "Laporan Rekapitulasi Absensi";
    const generatedDate = `Generated: ${new Date().toLocaleString("id-ID")}`;

    // Elegant Header
    doc.setFillColor(15, 23, 42); // slate-950
    doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(companyName, 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(reportTitle, 14, 30);
    doc.setFontSize(10);
    doc.text(generatedDate, doc.internal.pageSize.width - 14, 30, { align: "right" });

    // -- Table Config --
    const tableColumn = [
      "NIK",
      "Nama",
      "Divisi",
      "Periode",
      "Jam Magang",
      "Transport",
      "Hari",
      "Total",
      "Lembur"
    ];

    const tableRows = filteredRows.map((row: any) => [
      row.nik,
      row.name,
      row.division,
      row.periode,
      row.jamMagang,
      `Rp ${row.transport.toLocaleString("id-ID")}`,
      row.totalDays,
      `Rp ${row.totalTransport.toLocaleString("id-ID")}`,
      row.totalOvertime
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: [30, 41, 59], // slate-800
        lineColor: [203, 213, 225], // slate-300
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [15, 23, 42], // slate-950
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 20 }, // NIK
        1: { cellWidth: "auto" }, // Name
        2: { cellWidth: 25 }, // Division
        5: { halign: "right" }, // Transport
        6: { halign: "center" }, // Hari
        7: { halign: "right", fontStyle: "bold", textColor: [16, 185, 129] }, // Total (emerald-500 equivalent color)
        8: { cellWidth: 25 }, // Lembur
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // slate-50
      },
      margin: { top: 50 },
      didDrawPage: (data) => {
        // Footer
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Halaman ${pageCount}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      },
    });

    doc.save(`Rekap_Absensi_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Rekap Absensi</h1>
        <p className="text-slate-400">Laporan lengkap absensi karyawan & magang.</p>
      </div>

      <Card className="bg-[#1E293B] border-slate-800 text-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="size-5 text-blue-500" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-5 items-end">
          <div className="grid gap-2">
            <span className="text-sm text-slate-300">Divisi</span>
            <Select value={division} onValueChange={setDivision}>
              <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1E293B] border-slate-700 text-white">
                <SelectItem value="all" className="focus:bg-slate-800 focus:text-white">Semua</SelectItem>
                {data?.divisions.map((d: any) => (
                  <SelectItem key={d.name} value={d.name} className="focus:bg-slate-800 focus:text-white">
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <span className="text-sm text-slate-300">Nama/NIK</span>
            <Input
              placeholder="Cari..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white focus:border-blue-500"
            />
          </div>
          <div className="grid gap-2">
            <span className="text-sm text-slate-300">Periode</span>
            <Select value={periode} onValueChange={setPeriode}>
              <SelectTrigger className="bg-slate-950 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1E293B] border-slate-700 text-white">
                <SelectItem value="all" className="focus:bg-slate-800 focus:text-white">Semua</SelectItem>
                {periodeOptions.map((p: string) => (
                  <SelectItem key={p} value={p} className="focus:bg-slate-800 focus:text-white">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2">
            <Button onClick={handleExportPDF} className="bg-red-600 hover:bg-red-500 text-white">
              <FileText className="size-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={handleExportExcel} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              <FileSpreadsheet className="size-4 mr-2" />
              Export ke Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1E293B] border-slate-800 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Tabel Rekapitulasi</CardTitle>
            <div className="text-xs text-slate-500">Menampilkan {filteredRows.length} data</div>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto">
          <div className="rounded-lg border border-slate-800 overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm text-left">
              <thead className="bg-[#0F172A] text-slate-400 font-medium border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">NIK</th>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Divisi</th>
                  <th className="px-4 py-3">Periode</th>
                  <th className="px-4 py-3">Jam Magang</th>
                  <th className="px-4 py-3">Transport</th>
                  <th className="px-4 py-3">Jml Hari</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Total Lembur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sortedRows.map((r, i) => (
                  <tr key={r.nik + "-" + i} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{r.nik}</td>
                    <td className="px-4 py-3">{r.name}</td>
                    <td className="px-4 py-3 text-slate-400">{r.division}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{r.periode}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{r.jamMagang}</td>
                    <td className="px-4 py-3">Rp {r.transport.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 text-center">{r.totalDays}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-400">Rp {r.totalTransport.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3">{r.totalOvertime}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-12 text-center text-slate-500"
                    >
                      Tidak ada data yang ditemukan
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
