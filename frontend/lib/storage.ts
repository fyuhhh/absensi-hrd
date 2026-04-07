"use client";

import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import type { DB, Employee, Overtime, Settings, Attendance } from "./types";
import { todayYMD, nowHM, diffHMToHours, diffHMToMinutes } from "./time";
import { downloadCSV } from "./csv";

export const API_URL = "/api";
const KEY_SESSION = "attendance-session-token";
const KEY_USERINFO = "attendance-user-info";

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KEY_SESSION);
}

export function getHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

async function fetcher(url: string) {
  const res = await fetch(`${API_URL}${url}`, { 
    headers: getHeaders(),
    credentials: 'include' // Important for HttpOnly cookies
  });
  if (res.status === 401) {
    // 401 = token expired or missing — truly sign out
    signOut();
    throw new Error("Session expired. Please log in again.");
  }
  if (res.status === 403) {
    // 403 = Forbidden (no permission for this endpoint) — do NOT sign out
    // Just throw so SWR uses the fallbackData
    throw new Error("Access denied for this resource.");
  }
  if (!res.ok) throw new Error("API Error");
  const data = await res.json();
  
  // Recursively or simply map keys from snake_case to camelCase
  if (Array.isArray(data)) {
    return data.map(item => {
      const mapped: any = {};
      for (const [key, value] of Object.entries(item)) {
        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        // Handle dates
        if (value && (key === 'date' || key === 'periode_start' || key === 'periode_end')) {
          mapped[camelKey] = typeof value === 'string' ? value.split('T')[0] : new Date(value as any).toISOString().split('T')[0];
        } else {
            mapped[camelKey] = value;
        }
      }
      return mapped;
    });
  } else if (typeof data === 'object' && data !== null) {
      const mapped: any = {};
      for (const [key, value] of Object.entries(data)) {
        const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        mapped[camelKey] = value;
      }
      return mapped;
  }
  return data;
}

// Global DB hook equivalent for dashboard (needs to aggregate logic)
export function useDB() {
  const userInfoStr = typeof window !== 'undefined' ? localStorage.getItem(KEY_USERINFO) : null;
  const session = userInfoStr ? JSON.parse(userInfoStr) : null;
  const canSeeEmployees = session?.role === 'admin' || session?.role === 'admin_tj';

  // Only admins and admin_tj should fetch /employees
  const { data: employees } = useSWR(canSeeEmployees ? '/employees' : null, fetcher, { fallbackData: [] });
  const { data: divisions } = useSWR('/divisions', fetcher, { fallbackData: [] });
  const { data: attendance } = useSWR('/attendance', fetcher, { fallbackData: [] });
  const { data: overtime } = useSWR('/overtime', fetcher, { fallbackData: [] });
  const { data: settings } = useSWR('/settings', fetcher, { fallbackData: {} });
  
  return {
    data: {
      employees: employees || [],
      divisions: divisions || [],
      attendance: attendance || [],
      overtime: overtime || [],
      settings: settings || {},
      session: session
    },
    mutate: () => {
      if (canSeeEmployees) mutate('/employees');
      mutate('/divisions');
      mutate('/attendance');
      mutate('/overtime');
      mutate('/settings');
    }
  } as any;
}

export function useSchedulerSummary() {
  const { data, error, mutate } = useSWR('/scheduler/summary', fetcher);
  return {
    summary: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate
  };
}

export function useAdminDashboard() {
  const { data: summary, error: summaryError, mutate: mutateDash } = useSWR('/admin/dashboard-summary', fetcher);
  const { data: overtime, error: overtimeError } = useSWR('/overtime', fetcher);
  const [leaveCount, setLeaveCount] = useState(0);

  // Fetch leave count separately as it uses a different base URL in the existing code
  useEffect(() => {
    const fetchLeave = async () => {
      try {
        const res = await fetch(`${API_URL}/leave/all`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem("attendance-session-token")}` }
        });
        const result = await res.json();
        if (result.ok) {
          const pending = result.data.filter((r: any) => r.status === 'pending').length;
          setLeaveCount(pending);
        }
      } catch (err) {}
    };
    fetchLeave();
  }, [summary]); // Refresh when summary refreshes

  const pendingOvertimeCount = overtime ? overtime.filter((o: any) => o.status === 'pending').length : 0;

  return {
    data: {
      ...summary,
      pendingOvertimeCount,
      pendingLeaveCount: leaveCount
    },
    isLoading: !summary && !summaryError,
    isError: summaryError || overtimeError,
    mutate: mutateDash
  };
}

export function usePendingCounts() {
  const { data: overtime } = useSWR('/overtime', fetcher);
  const [leaveCount, setLeaveCount] = useState(0);

  useEffect(() => {
    const fetchLeave = async () => {
      try {
        const res = await fetch(`${API_URL}/leave/all`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem("attendance-session-token")}` }
        });
        const result = await res.json();
        if (result.ok) {
          const pending = result.data.filter((r: any) => r.status === 'pending').length;
          setLeaveCount(pending);
        }
      } catch (err) {}
    };
    fetchLeave();
  }, []);

  const pendingOvertimeCount = overtime ? overtime.filter((o: any) => o.status === 'pending').length : 0;

  return {
    pendingOvertimeCount,
    pendingLeaveCount: leaveCount,
    total: pendingOvertimeCount + leaveCount
  };
}

export async function signIn(nik: string, password: string): Promise<{ ok: boolean; user?: Employee; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nik, password }),
      credentials: 'include'
    });
    const data = await res.json();
    if (!data.ok) return { ok: false, error: data.error };
    
    localStorage.setItem(KEY_USERINFO, JSON.stringify({ 
      nik: data.user.nik, 
      role: data.user.role,
      name: data.user.name 
    }));
    
    return { ok: true, user: data.user };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function signOut() {
  if (typeof window !== 'undefined') {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {}
    localStorage.removeItem(KEY_USERINFO);
    window.location.href = '/';
  }
}

export function useCurrentUser() {
  const userInfoStr = typeof window !== 'undefined' ? localStorage.getItem(KEY_USERINFO) : null;
  const session = userInfoStr ? JSON.parse(userInfoStr) : null;
  return session;
}

export async function upsertEmployee(emp: Employee): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/employees`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
          nik: emp.nik,
          name: emp.name,
          password: emp.password,
          division: emp.division,
          role: emp.role || 'user',
          status: emp.status || 'active',
          scheduleType: emp.scheduleType || 'fixed',
          defaultStart: emp.defaultStart,
          defaultEnd: emp.defaultEnd,
          transportPerDay: emp.transportPerDay
      }),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || "Gagal menyimpan data" };
    mutate('/employees');
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function deleteEmployee(nik: string) {
  await fetch(`${API_URL}/employees/${nik}`, { method: 'DELETE', headers: getHeaders(), credentials: 'include' });
  mutate('/employees');
}

export async function addDivision(name: string) {
  await fetch(`${API_URL}/divisions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name }),
    credentials: 'include'
  });
  mutate('/divisions');
}

export async function removeDivision(name: string) {
  await fetch(`${API_URL}/divisions/${name}`, { method: 'DELETE', headers: getHeaders(), credentials: 'include' });
  mutate('/divisions');
}

export async function saveSettings(patch: Partial<Settings>) {
  await fetch(`${API_URL}/settings`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(patch),
    credentials: 'include'
  });
  mutate('/settings');
}

export async function checkIn(lat?: number, lng?: number) {
  const res = await fetch(`${API_URL}/attendance/check-in`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ lat: lat || -1.273985438554323, lng: lng || 116.85826015112536 }), // fallback if no gps
    credentials: 'include'
  });
  if (!res.ok) {
      if (res.status === 403 || res.status === 401) {
          signOut();
          throw new Error("Session expired. Please log in again.");
      }
      const data = await res.json();
      throw new Error(data.error);
  }
  mutate('/attendance');
}

export async function checkOut() {
  const res = await fetch(`${API_URL}/attendance/check-out`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include'
  });
  if (!res.ok) {
      if (res.status === 403 || res.status === 401) {
          signOut();
          throw new Error("Session expired. Please log in again.");
      }
      const data = await res.json();
      throw new Error(data.error);
  }
  mutate('/attendance');
}

export async function submitOvertime(payload: {
  date: string;
  inTime: string;
  outTime: string;
  photo?: string | null;
}) {
  const res = await fetch(`${API_URL}/overtime`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
    credentials: 'include'
  });
  const data = await res.json();
  if (!res.ok) return { ok: false, error: data.error };
  mutate('/overtime');
  return { ok: true };
}

export async function approveOvertime(id: string) {
  await fetch(`${API_URL}/overtime/${id}/approve`, { method: 'PUT', headers: getHeaders(), credentials: 'include' });
  mutate('/overtime');
  mutate('/attendance');
}

export async function rejectOvertime(id: string) {
  await fetch(`${API_URL}/overtime/${id}/reject`, { method: 'PUT', headers: getHeaders(), credentials: 'include' });
  mutate('/overtime');
}

export function useTodayStats() {
  const { data: employees } = useSWR('/employees', fetcher, { fallbackData: [] });
  const { data: attendance } = useSWR('/attendance', fetcher, { fallbackData: [] });
  
  const date = todayYMD();
  const totalEmployees =
    employees.filter((e: any) => e.status === "active" && e.role !== "admin")
      .length || 0;
  const presentToday =
    attendance.filter((a: any) => a.date === date).length || 0;
  const avgLateMins = (() => {
    const todays =
      attendance.filter(
        (a: any) => a.date === date && (a.lateMinutes ?? 0) > 0
      ) || [];
    if (todays.length === 0) return 0;
    const sum = todays.reduce((acc: number, cur: any) => acc + (cur.lateMinutes || 0), 0);
    return Math.round(sum / todays.length);
  })();
  return { totalEmployees, presentToday, avgLateMins };
}

export async function upsertSchedule(payload: { 
  nik: string; 
  date?: string; 
  startDate?: string; 
  endDate?: string; 
  startTime: string; 
  endTime: string 
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/scheduler`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        nik: payload.nik,
        date: payload.date,
        startDate: payload.startDate,
        endDate: payload.endDate,
        startTime: payload.startTime,
        endTime: payload.endTime
      }),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || "Gagal menyimpan jadwal" };
    mutate((key) => typeof key === 'string' && key.startsWith('/scheduler/user/'));
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function deleteSchedule(id: number): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_URL}/scheduler/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include'
    });
    if (!res.ok) throw new Error("Gagal menghapus jadwal");
    mutate((key) => typeof key === 'string' && key.startsWith('/scheduler/user/'));
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export function useSchedules(nik?: string) {
  const { data, error, isLoading, mutate } = useSWR(nik ? `/scheduler/user/${nik}` : null, fetcher);
  return { schedules: data || [], error, isLoading, mutate };
}

export function exportAttendanceCSV(rows: any[]) {
  downloadCSV(`rekap-${todayYMD()}.csv`, rows);
}

export type { Employee, Attendance, Overtime, Division, Settings, DB, DashboardSummary, ActivityLog } from "./types";
