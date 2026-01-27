"use client";

import useSWR, { mutate } from "swr";
import type { DB, Employee, Overtime, Settings } from "./types";
import { todayYMD, diffHMToHours, diffHMToMinutes } from "./time";
import { downloadCSV } from "./csv";

const KEY = "attendance-db";

function initDB(): DB {
  const existing = localStorage.getItem(KEY);
  if (existing) return JSON.parse(existing);
  const db: DB = {
    employees: [
      {
        nik: "admin",
        name: "Admin",
        password: "admin",
        division: "Manajemen",
        transportPerDay: 0,
        status: "active",
        scheduleType: "fixed",
        defaultStart: "09:00",
        defaultEnd: "15:00",
        role: "admin",
      },
      {
        nik: "1001",
        name: "Budi",
        password: "budi",
        division: "Magang",
        transportPerDay: 25000,
        status: "active",
        scheduleType: "fixed",
        defaultStart: "09:00",
        defaultEnd: "15:00",
      },
      {
        nik: "1002",
        name: "Sari",
        password: "sari",
        division: "Dw VM",
        transportPerDay: 25000,
        status: "active",
        scheduleType: "flexible",
      },
    ],
    divisions: [
      { name: "Manajemen" },
      { name: "Magang" },
      { name: "Dw VM" },
      { name: "Dw Civil" },
      { name: "FoodCourt" },
    ],
    attendance: [],
    overtime: [],
    settings: {
      defaultStart: "09:00",
      defaultEnd: "15:00",
      officeLat: -6.2,
      officeLng: 106.816666,
      radiusMeters: 200,
    },
    session: null,
  };
  localStorage.setItem(KEY, JSON.stringify(db));
  return db;
}

function saveDB(db: DB) {
  localStorage.setItem(KEY, JSON.stringify(db));
  mutate(KEY, db, false);
}

export function useDB() {
  return useSWR<DB>(KEY, {
    fetcher: () => {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : initDB();
    },
    revalidateOnFocus: false,
    revalidateOnMount: true,
  });
}

export function signIn(
  nik: string,
  password: string
): { ok: boolean; user?: Employee; error?: string } {
  const db = initDB();
  const user = db.employees.find(
    (e) => e.nik === nik && e.password === password && e.status === "active"
  );
  if (!user)
    return { ok: false, error: "NIK atau password salah / akun nonaktif" };
  db.session = {
    nik: user.nik,
    role: user.role === "admin" ? "admin" : "user",
  };
  saveDB(db);
  return { ok: true, user };
}

export function signOut() {
  const db = initDB();
  db.session = null;
  saveDB(db);
}

export function useCurrentUser() {
  const { data } = useDB();
  const nik = data?.session?.nik;
  return data?.employees.find((e) => e.nik === nik);
}

export function upsertEmployee(emp: Employee) {
  const db = initDB();
  const idx = db.employees.findIndex((e) => e.nik === emp.nik);
  if (idx >= 0) db.employees[idx] = emp;
  else db.employees.push(emp);
  saveDB(db);
}

export function deleteEmployee(nik: string) {
  const db = initDB();
  db.employees = db.employees.filter((e) => e.nik !== nik);
  if (db.session?.nik === nik) db.session = null;
  saveDB(db);
}

export function addDivision(name: string) {
  const db = initDB();
  if (!db.divisions.find((d) => d.name.toLowerCase() === name.toLowerCase())) {
    db.divisions.push({ name });
    saveDB(db);
  }
}

export function removeDivision(name: string) {
  const db = initDB();
  db.divisions = db.divisions.filter((d) => d.name !== name);
  saveDB(db);
}

export function saveSettings(patch: Partial<Settings>) {
  const db = initDB();
  db.settings = { ...db.settings, ...patch };
  saveDB(db);
}

function ensureTodayRow(db: DB, nik: string, date = todayYMD()) {
  let row = db.attendance.find((a) => a.nik === nik && a.date === date);
  if (!row) {
    row = { nik, date };
    db.attendance.push(row);
  }
  return row;
}

export function checkIn() {
  const db = initDB();
  const nik = db.session?.nik;
  if (!nik) return;
  const user = db.employees.find((e) => e.nik === nik);
  if (!user) return;
  const date = todayYMD();
  const row = ensureTodayRow(db, nik, date);
  if (!row.inTime) {
    const now = new Date();
    const inTime = now.toTimeString().slice(0, 5);
    row.inTime = inTime;
    // lateness if fixed
    if (user.scheduleType === "fixed") {
      const defStart = user.defaultStart || db.settings.defaultStart;
      const late = diffHMToMinutes(defStart, inTime);
      row.lateMinutes = late > 0 ? late : 0;
      row.note = late > 0 ? `Terlambat ${late} menit` : "Tepat waktu";
    } else {
      row.note = "Fleksibel";
    }
  }
  saveDB(db);
}

export function checkOut() {
  const db = initDB();
  const nik = db.session?.nik;
  if (!nik) return;
  const user = db.employees.find((e) => e.nik === nik);
  if (!user) return;
  const date = todayYMD();
  const row = ensureTodayRow(db, nik, date);
  if (!row.outTime) {
    const now = new Date();
    const outTime = now.toTimeString().slice(0, 5);
    row.outTime = outTime;
    const startHM = row.inTime || user.defaultStart || db.settings.defaultStart;
    const hours = diffHMToHours(startHM, outTime);
    row.totalHours = Number(hours.toFixed(2));
    if (user.scheduleType === "fixed") {
      const defEnd = user.defaultEnd || db.settings.defaultEnd;
      if (diffHMToMinutes(outTime, defEnd) > 0) {
        // out < default end => early leave
        row.note = row.note ? `${row.note}, Pulang awal` : "Pulang awal";
      }
    }
  }
  saveDB(db);
}

export function submitOvertime(payload: {
  date: string;
  inTime: string;
  outTime: string;
  note?: string;
  photo?: string | null;
}) {
  const db = initDB();
  const nik = db.session?.nik;
  if (!nik) return;
  const hours = diffHMToHours(payload.inTime, payload.outTime);
  const item: Overtime = {
    id: `ot_${Date.now()}`,
    nik,
    date: payload.date,
    inTime: payload.inTime,
    outTime: payload.outTime,
    hours,
    note: payload.note,
    photo: payload.photo,
    status: "pending",
  };
  db.overtime.push(item);
  saveDB(db);
}

export function approveOvertime(id: string) {
  const db = initDB();
  const o = db.overtime.find((x) => x.id === id);
  if (!o) return;
  const hours =
    typeof o.hours === "number" ? o.hours : diffHMToHours(o.inTime, o.outTime);
  o.hours = hours;
  o.status = "approved";
  // attach hours to attendance day note/field
  const day = db.attendance.find((a) => a.nik === o.nik && a.date === o.date);
  if (day) {
    day.note = day.note
      ? `${day.note}, Lembur ${hours.toFixed(2)} jam`
      : `Lembur ${hours.toFixed(2)} jam`;
    day.overtimeHours = (day.overtimeHours || 0) + hours;
  } else {
    db.attendance.push({
      nik: o.nik,
      date: o.date,
      note: `Lembur ${hours.toFixed(2)} jam`,
      overtimeHours: hours,
    });
  }
  saveDB(db);
}

export function rejectOvertime(id: string) {
  const db = initDB();
  const o = db.overtime.find((x) => x.id === id);
  if (!o) return;
  o.status = "rejected";
  saveDB(db);
}

export function useTodayStats() {
  const { data } = useDB();
  const date = todayYMD();
  const totalEmployees =
    data?.employees.filter((e) => e.status === "active" && e.role !== "admin")
      .length || 0;
  const presentToday =
    data?.attendance.filter((a) => a.date === date).length || 0;
  const avgLateMins = (() => {
    const todays =
      data?.attendance.filter(
        (a) => a.date === date && (a.lateMinutes ?? 0) > 0
      ) || [];
    if (todays.length === 0) return 0;
    const sum = todays.reduce((acc, cur) => acc + (cur.lateMinutes || 0), 0);
    return Math.round(sum / todays.length);
  })();
  return { totalEmployees, presentToday, avgLateMins };
}

// Export helpers
export function exportAttendanceCSV(rows: any[]) {
  downloadCSV(`rekap-${todayYMD()}.csv`, rows);
}

export type { Employee } from "./types";
