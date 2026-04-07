const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth, requireAdminTJ } = require('../middleware/auth');

// Get all custom schedules for a user
router.get('/user/:nik', requireAuth, requireAdminTJ, async (req, res) => {
    try {
        const { nik } = req.params;
        const [rows] = await db.execute(
            'SELECT id, nik, date, start_time as startTime, end_time as endTime FROM employee_schedules WHERE nik = ? ORDER BY date ASC',
            [nik]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a summary of all custom schedules (for admin_tj dashboard)
router.get('/summary', requireAuth, requireAdminTJ, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT es.id, es.nik, es.date, es.start_time as startTime, es.end_time as endTime, e.name 
            FROM employee_schedules es
            JOIN employees e ON es.nik = e.nik
            ORDER BY es.date DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upsert a custom schedule
router.post('/', requireAuth, requireAdminTJ, async (req, res) => {
    try {
        const { nik, date, startTime, endTime, startDate, endDate } = req.body;

        const dateList = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate && endDate) {
            // Range logic
            const current = new Date(startDate);
            const stop = new Date(endDate);
            while (current <= stop) {
                const d = new Date(current);
                if (d > today) {
                    dateList.push(d.toISOString().split('T')[0]);
                }
                current.setDate(current.getDate() + 1);
            }
        } else if (date) {
            // Single date logic
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);
            if (targetDate > today) {
                dateList.push(date);
            }
        }

        if (dateList.length === 0) {
            return res.status(400).json({ error: 'Tidak ada tanggal di masa depan yang valid atau rentang tanggal salah.' });
        }

        // Upsert all dates
        for (const d of dateList) {
            const [existing] = await db.execute(
                'SELECT id FROM employee_schedules WHERE nik = ? AND date = ?',
                [nik, d]
            );

            if (existing.length > 0) {
                await db.execute(
                    'UPDATE employee_schedules SET start_time = ?, end_time = ? WHERE id = ?',
                    [startTime, endTime, existing[0].id]
                );
            } else {
                await db.execute(
                    'INSERT INTO employee_schedules (nik, date, start_time, end_time) VALUES (?, ?, ?, ?)',
                    [nik, d, startTime, endTime]
                );
            }
        }

        res.json({ ok: true, count: dateList.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a custom schedule
router.delete('/:id', requireAuth, requireAdminTJ, async (req, res) => {
    try {
        await db.execute('DELETE FROM employee_schedules WHERE id = ?', [req.params.id]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
