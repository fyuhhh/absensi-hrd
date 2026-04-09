const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');

function getTodayYMD() {
    const d = new Date();
    // Use Asia/Makassar timezone for WITA (Balikpapan)
    const format = new Intl.DateTimeFormat('fr-CA', { timeZone: 'Asia/Makassar', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
    return format; 
}
function getNowHM() {
    const d = new Date();
    return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Makassar', hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
}
function diffHMToMinutes(t1, t2) {
    const [h1, m1] = t1.split(':').map(Number);
    const [h2, m2] = t2.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
}

// Get history / today
router.get('/', requireAuth, async (req, res) => {
    try {
        let query = 'SELECT * FROM attendance';
        const params = [];

        if (req.user.role !== 'admin') {
            query += ' WHERE nik = ?';
            params.push(req.user.nik);
        }
        query += ' ORDER BY date DESC LIMIT 100';

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/check-in', requireAuth, async (req, res) => {
    try {
        const { lat, lng, photo } = req.body;
        const nik = req.user.nik;
        const dateStr = getTodayYMD();
        const inTime = getNowHM();

        // Check if already checked in
        const [existing] = await db.execute('SELECT * FROM attendance WHERE nik = ? AND date = ?', [nik, dateStr]);
        
        if (existing.length > 0 && existing[0].in_time) {
            return res.status(400).json({ error: 'Sudah absen masuk hari ini' });
        }

        // Get Employee info for late calculation
        const [users] = await db.execute('SELECT * FROM employees WHERE nik = ?', [nik]);
        const [settings] = await db.execute('SELECT * FROM settings WHERE id = 1');
        
        const user = users[0];
        const setting = settings[0];
        
        let lateMinutes = 0;
        let note = "Tepat waktu";

        if (user.schedule_type === 'fixed') {
            let defStart = user.default_start || setting.default_start;
            
            // Check for date-specific schedule override
            const [customSchedules] = await db.execute(
                'SELECT * FROM employee_schedules WHERE nik = ? AND date = ?',
                [nik, dateStr]
            );
            if (customSchedules.length > 0) {
                defStart = customSchedules[0].start_time;
            }

            const late = diffHMToMinutes(defStart, inTime);
            if (late > 0) {
                lateMinutes = late;
                note = `Terlambat ${late} menit`;
            }
        } else {
            note = "Fleksibel";
        }

        if (existing.length > 0) {
            await db.execute('UPDATE attendance SET in_time=?, lat=?, lng=?, in_photo=?, late_minutes=?, note=? WHERE id=?', 
                [inTime, lat || null, lng || null, photo || null, lateMinutes, note, existing[0].id]);
        } else {
            await db.execute('INSERT INTO attendance (nik, date, in_time, lat, lng, in_photo, late_minutes, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [nik, dateStr, inTime, lat || null, lng || null, photo || null, lateMinutes, note]);
        }

        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/check-out', requireAuth, async (req, res) => {
    try {
        const nik = req.user.nik;
        const dateStr = getTodayYMD();
        const outTime = getNowHM();

        const [existing] = await db.execute('SELECT * FROM attendance WHERE nik = ? AND date = ?', [nik, dateStr]);
        if (existing.length === 0) {
            return res.status(400).json({ error: 'Belum absen masuk hari ini' });
        }
        
        const row = existing[0];
        if (row.out_time) {
            return res.status(400).json({ error: 'Sudah absen keluar hari ini' });
        }

        const [users] = await db.execute('SELECT * FROM employees WHERE nik = ?', [nik]);
        const [settings] = await db.execute('SELECT * FROM settings WHERE id = 1');
        const user = users[0];
        const setting = settings[0];

        const [customSchedules] = await db.execute(
            'SELECT * FROM employee_schedules WHERE nik = ? AND date = ?',
            [nik, dateStr]
        );

        const inTime = row.in_time || (customSchedules.length > 0 ? customSchedules[0].start_time : (user.default_start || setting.default_start));
        const hours = diffHMToMinutes(inTime, outTime) / 60;
        
        let note = row.note || "";
        if (user.schedule_type === 'fixed') {
            let defEnd = user.default_end || setting.default_end;
            if (customSchedules.length > 0) {
                defEnd = customSchedules[0].end_time;
            }

            if (diffHMToMinutes(outTime, defEnd) > 0) {
                note = note ? `${note}, Pulang awal` : "Pulang awal";
            }
        }

        await db.execute('UPDATE attendance SET out_time=?, total_hours=?, note=? WHERE id=?',
            [outTime, hours.toFixed(2), note, row.id]);

        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
