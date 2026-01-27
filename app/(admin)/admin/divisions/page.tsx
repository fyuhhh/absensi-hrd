"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { addDivision, removeDivision, useDB } from "@/lib/storage"
import { useState } from "react"
import { PlusCircle, Search, Trash2, Layers } from "lucide-react"

export default function DivisionsPage() {
  const { data } = useDB()
  const [name, setName] = useState("")

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Pengaturan Divisi</h1>
        <p className="text-slate-400">Kelola daftar divisi atau departemen.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        <Card className="bg-[#1E293B] border-slate-800 text-white h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <PlusCircle className="size-5 text-blue-500" />
              Tambah Divisi Baru
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input
              placeholder="Nama divisi..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-950 border-slate-700 text-white focus:border-blue-500"
            />
            <Button
              className="bg-blue-600 hover:bg-blue-500 text-white"
              onClick={() => {
                if (name.trim()) {
                  addDivision(name.trim())
                  setName("")
                }
              }}
            >
              Tambah
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#1E293B] border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Layers className="size-5 text-blue-500" />
              Daftar Divisi Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {data?.divisions.map((d) => (
                <div key={d.name} className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/50 p-4 hover:border-slate-600 transition-all">
                  <span className="font-medium">{d.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDivision(d.name)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Hapus
                  </Button>
                </div>
              ))}
              {(!data || data.divisions.length === 0) && (
                <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  Belum ada divisi yang terdaftar
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
