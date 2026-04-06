"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDB } from "@/lib/storage";
import { User, ChevronRight, ClipboardList, Search, Fingerprint, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export default function PersonsPage() {
  const { data } = useDB();
  const [search, setSearch] = useState("");

  const filteredEmployees = data?.employees.filter((e: any) => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.nik.includes(search)
  ) || [];

  return (
    <main className="space-y-6 pb-20 max-w-5xl mx-auto px-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
          Detail <span className="text-blue-500">Perorang</span>
        </h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-none">Manajemen Profil & Histori Absensi</p>
      </div>

      {/* Search Section */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="size-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <Input
          placeholder="Cari NIK atau Nama Karyawan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-900/50 border-slate-800 text-white pl-11 h-14 rounded-2xl focus:border-blue-500/50 focus:ring-0 backdrop-blur-md transition-all font-medium"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredEmployees.map((e: any, idx: number) => (
            <motion.div
              key={e.nik}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Link href={`/admin/persons/${e.nik}`}>
                <Card className="bg-slate-900/50 border-slate-800 text-white rounded-[2rem] hover:border-blue-500/30 transition-all group active:scale-[0.98] h-full overflow-hidden relative">
                   {/* Background Glow Effect */}
                   <div className="absolute -right-4 -top-4 size-24 bg-blue-500/5 blur-3xl rounded-full group-hover:bg-blue-500/10 transition-all" />
                   
                   <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="size-12 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-blue-500/10 transition-colors">
                            <User className="size-6 text-slate-400 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white truncate group-hover:text-blue-400 transition-colors uppercase tracking-tight">{e.name}</h3>
                            <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
                                <Fingerprint className="size-3" />
                                <span className="text-[10px] font-mono tracking-widest">{e.nik}</span>
                            </div>
                        </div>
                        <ChevronRight className="size-5 text-slate-700 group-hover:text-blue-500 transition-all translate-x-0 group-hover:translate-x-1 shrink-0 mt-1" />
                      </div>

                      <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                {e.division || 'Umum'}
                            </span>
                         </div>
                         <div className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter italic">
                             View Details
                         </div>
                      </div>
                   </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredEmployees.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="sm:col-span-2 lg:col-span-3 py-20 flex flex-col items-center justify-center gap-4 text-slate-600"
          >
            <div className="p-6 bg-slate-900/30 rounded-3xl border border-slate-800 italic">
                <ClipboardList className="size-12 opacity-20" />
            </div>
            <p className="font-bold uppercase tracking-widest text-[10px]">Data Karyawan Tidak Ditemukan</p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
