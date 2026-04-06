// Basic domain types for the attendance app

export type Role = "admin" | "user";

export type Employee = {
  nik: string;
  name: string;
  password: string;
  plaintextPassword?: string;
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
export type Attendance = AttendanceRecord;

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

export type DashboardSummary = {
  totalEmployees: number;
  presentCount: number;
  lateCount: number;
  todaysAttendance: {
    nik: string;
    name: string;
    division: string;
    inTime: string;
    lateMinutes: number;
    note: string;
  }[];
  recentActivity: ActivityLog[];
  chartData: { month: string; present: number; total: number }[];
  divisionStats: { name: string; count: number }[];
  overtimeTrends: { date: string; count: number }[];
  pendingOvertimeCount: number;
  pendingLeaveCount: number;
};

export type ActivityLog = {
  name: string;
  action: string;
  time: string;
  date: string;
  status: "On Time" | "Late" | "Verified";
};

export type DB = {
  employees: Employee[];
  divisions: Division[];
  attendance: AttendanceRecord[];
  overtime: Overtime[];
  settings: Settings;
  session?: { nik: string; role: Role; name: string } | null;
};
