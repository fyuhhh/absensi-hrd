const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

function diffHMToHours(t1, t2) {
    const [h1, m1] = t1.split(':').map(Number);
    const [h2, m2] = t2.split(':').map(Number);
    return ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60;
}

// Get overtime
router.get('/', requireAuth, async (req, res) => {
    try {
        let query = 'SELECT * FROM overtime';
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

// Submit overtime
router.post('/', requireAuth, async (req, res) => {
    try {
        const { date, inTime, outTime, note, photo } = req.body;
        const nik = req.user.nik;

        // Check duplicate
        const [existing] = await db.execute('SELECT * FROM overtime WHERE nik = ? AND date = ? AND status != "rejected"', [nik, date]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Sudah ada pengajuan lembur pada tanggal ini' });
        }

        const hours = diffHMToHours(inTime, outTime);
        const id = `ot_${Date.now()}`;

        await db.execute(
            'INSERT INTO overtime (id, nik, date, in_time, out_time, hours, note, photo, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, nik, date, inTime, outTime, hours, note || null, photo || null, 'pending']
        );

        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Approve overtime
router.put('/:id/approve', requireAuth, requireAdmin, async (req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [rows] = await conn.execute('SELECT * FROM overtime WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });

        const o = rows[0];
        if (o.status === 'approved') return res.json({ ok: true });

        await conn.execute('UPDATE overtime SET status = "approved" WHERE id = ?', [o.id]);

        // Add to attendance note
        const [att] = await conn.execute('SELECT * FROM attendance WHERE nik = ? AND date = ?', [o.nik, o.date]);
        const lemburText = `Lembur ${parseFloat(o.hours).toFixed(2)} jam`;

        if (att.length > 0) {
            let note = att[0].note || '';
            if (!note.includes('Lembur')) {
                note = note ? `${note}, ${lemburText}` : lemburText;
            }
            const otHours = (parseFloat(att[0].overtime_hours) || 0) + parseFloat(o.hours);
            await conn.execute('UPDATE attendance SET note = ?, overtime_hours = ? WHERE id = ?', [note, otHours, att[0].id]);
        } else {
            // Create dummy attendance record for overtime
            await conn.execute('INSERT INTO attendance (nik, date, note, overtime_hours) VALUES (?, ?, ?, ?)',
                [o.nik, o.date, lemburText, parseFloat(o.hours)]);
        }

        await conn.commit();
        res.json({ ok: true });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// Reject overtime
router.put('/:id/reject', requireAuth, requireAdmin, async (req, res) => {
    try {
        await db.execute('UPDATE overtime SET status = "rejected" WHERE id = ?', [req.params.id]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
