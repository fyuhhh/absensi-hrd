"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { addDivision, removeDivision, useDB } from "@/lib/storage"
import { useState } from "react"
import { PlusCircle, Search, Trash2, Layers, Building2, Trash } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export default function DivisionsPage() {
  const { data } = useDB()
  const [name, setName] = useState("")

  const handleAdd = () => {
    if (name.trim()) {
      addDivision(name.trim())
      setName("")
      toast.success(`Divisi "${name}" ditambahkan`)
    }
  }

  return (
    <main className="space-y-6 pb-10 max-w-4xl mx-auto px-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
          Pengaturan <span className="text-blue-500">Divisi</span>
        </h1>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Kelola Daftar Departemen</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_1.5fr] items-start">
        {/* Form Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-slate-900/50 border-slate-800 text-white rounded-[2.5rem] shadow-2xl backdrop-blur-md overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-black uppercase tracking-wider flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <PlusCircle className="size-5 text-blue-500" />
                </div>
                Tambah Divisi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nama Divisi</Label>
                <Input
                  placeholder="Contoh: IT, HRD, Sales..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  className="bg-slate-950 border-slate-800 text-white focus:border-blue-500 h-12 rounded-2xl"
                />
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                onClick={handleAdd}
              >
                Simpan Divisi
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* List Card */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-4">
              <Layers className="size-4 text-blue-500" />
              <h2 className="text-xs font-black text-white uppercase tracking-widest">Daftar Divisi Aktif</h2>
          </div>
          
          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {data?.divisions.map((d, i) => (
                <motion.div 
                  key={d.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-slate-800 bg-slate-900/50 p-4 hover:border-slate-700 transition-all group shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="size-10 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-blue-400 border border-slate-700 group-hover:bg-blue-500/10 transition-colors">
                        <Building2 className="size-4" />
                    </div>
                    <span className="font-bold text-white group-hover:text-blue-400 transition-colors">{d.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                        if (confirm(`Yakin ingin menghapus divisi ${d.name}?`)) {
                            removeDivision(d.name);
                            toast.success("Divisi dihapus");
                        }
                    }}
                    className="h-10 w-10 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl"
                  >
                    <Trash className="size-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {(!data || data.divisions.length === 0) && (
              <div className="text-center py-12 text-slate-600 font-bold uppercase tracking-widest text-[10px] border border-dashed border-slate-800 rounded-[2rem] bg-slate-900/20">
                Belum ada divisi yang terdaftar
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

// Minimal helper to avoid import issues
function Label({ children, className }: any) {
    return <label className={className}>{children}</label>
}
