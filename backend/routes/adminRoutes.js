const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/dashboard-summary', requireAuth, requireAdmin, async (req, res) => {
    try {
        const today = new Intl.DateTimeFormat('fr-CA', { timeZone: 'Asia/Makassar', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

        // 1. Total Active Employees (excluding admin)
        const [empRows] = await db.execute('SELECT COUNT(*) as count FROM employees WHERE status = "active" AND role != "admin"');
        const totalEmployees = empRows[0].count;

        // 2. Today's Attendance
        const [attRows] = await db.execute(`
            SELECT a.*, e.name, e.division_id, d.name as division_name 
            FROM attendance a
            JOIN employees e ON a.nik = e.nik
            LEFT JOIN divisions d ON e.division_id = d.id
            WHERE a.date = ?
        `, [today]);

        const presentCount = attRows.length;
        const lateList = attRows.filter(a => (a.late_minutes || 0) > 0);
        const lateCount = lateList.length;

        // 3. Recent Activity (Last 10 overall actions across all days for broad view, or just today)
        // Let's get last 10 records with names
        const [recentRows] = await db.execute(`
            SELECT a.*, e.name 
            FROM attendance a
            JOIN employees e ON a.nik = e.nik
            ORDER BY a.date DESC, a.in_time DESC
            LIMIT 10
        `);

        // 4. Monthly Stats (for Chart) - Last 6 months
        const [chartRows] = await db.execute(`
            SELECT 
                DATE_FORMAT(date, '%b') as month,
                COUNT(*) as present,
                (SELECT COUNT(*) FROM employees WHERE status = 'active' AND role != 'admin') as total
            FROM attendance
            WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(date, '%Y-%m'), month
            ORDER BY date ASC
        `);

        // 5. Division Stats
        const [divStatsRows] = await db.execute(`
            SELECT d.name as name, COUNT(a.id) as count
            FROM divisions d
            LEFT JOIN employees e ON d.id = e.division_id
            LEFT JOIN attendance a ON e.nik = a.nik AND a.date = ?
            GROUP BY d.id, d.name
        `, [today]);

        // 6. Overtime Trends (Last 7 days)
        const [otTrendsRows] = await db.execute(`
            SELECT date, COUNT(*) as count
            FROM overtime
            WHERE status = 'approved' AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY date
            ORDER BY date ASC
        `);

        res.json({
            totalEmployees,
            presentCount,
            lateCount,
            todaysAttendance: attRows.map(a => ({
                nik: a.nik,
                name: a.name,
                division: a.division_name,
                inTime: a.in_time,
                lateMinutes: a.late_minutes,
                note: a.note
            })),
            recentActivity: recentRows.map(r => ({
                name: r.name,
                action: r.out_time ? "Check Out" : "Check In",
                time: r.out_time || r.in_time,
                date: r.date,
                status: (r.late_minutes || 0) > 0 ? "Late" : "On Time"
            })),
            chartData: chartRows,
            divisionStats: divStatsRows,
            overtimeTrends: otTrendsRows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
