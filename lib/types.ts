// Basic domain types for the attendance app

export type Role = "admin" | "user";

export type Employee = {
  nik: string;
  name: string;
  password: string;
  division: string;
  transportPerDay: number;
  status: "active" | "inactive";
  scheduleType: "fixed" | "flexible";
  defaultStart?: string; // "HH:MM"
  defaultEnd?: string; // "HH:MM"
  periodeStart?: string; // YYYY-MM-DD
  periodeEnd?: string; // YYYY-MM-DD
  role?: Role; // only "admin" for special login user
};

export type AttendanceRecord = {
  nik: string;
  date: string; // YYYY-MM-DD
  inTime?: string; // HH:MM
  outTime?: string; // HH:MM
  totalHours?: number;
  lateMinutes?: number;
  note?: string;
  photo?: string | null;
  overtimeHours?: number;
  lat?: number;
  lng?: number;
};

export type Overtime = {
  id: string;
  nik: string;
  date: string;
  inTime: string;
  outTime: string;
  hours: number;
  note?: string;
  photo?: string | null;
  status: "pending" | "approved" | "rejected";
};

export type Division = { name: string };

export type Settings = {
  defaultStart: string;
  defaultEnd: string;
  officeLat: number;
  officeLng: number;
  radiusMeters: number;
};

export type DB = {
  employees: Employee[];
  divisions: Division[];
  attendance: AttendanceRecord[];
  overtime: Overtime[];
  settings: Settings;
  session?: { nik: string; role: Role } | null;
};
