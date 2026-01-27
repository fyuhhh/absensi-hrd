"use client"

import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts'

export function AttendanceChart({ data }: { data: any[] }) {
    if (!data) return null
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#fff',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                    itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="present" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
            </AreaChart>
        </ResponsiveContainer>
    )
}

export function DailyStatusChart({ stats }: { stats: any }) {
    if (!stats) return null
    const data = [
        { name: 'On Time', value: stats.presentToday, color: '#10B981' },
        { name: 'Late', value: 2, color: '#F59E0B' }, // Mock data for late
        { name: 'Absent', value: Math.max(stats.totalEmployees - stats.presentToday, 0), color: '#EF4444' },
    ]

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#fff',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}
