const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// Submit Leave Request (User)
router.post('/submit', requireAuth, async (req, res) => {
    try {
        const { type, startDate, endDate, reason, photo } = req.body;
        const nik = req.user.nik;

        if (!startDate || !endDate || !type) {
            return res.status(400).json({ ok: false, error: 'Tanggal dan tipe pengajuan wajib diisi' });
        }

        await db.execute(
            'INSERT INTO leave_requests (nik, type, start_date, end_date, reason, photo) VALUES (?, ?, ?, ?, ?, ?)',
            [nik, type, startDate, endDate, reason || null, photo || null]
        );

        res.json({ ok: true, message: 'Pengajuan berhasil dikirim' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Get My Leave Requests (User)
router.get('/my', requireAuth, async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM leave_requests WHERE nik = ? ORDER BY created_at DESC',
            [req.user.nik]
        );
        res.json({ ok: true, data: rows });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Admin: Get All Leave Requests
router.get('/all', requireAuth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ ok: false, error: 'Unauthorized' });
        }
        const [rows] = await db.execute(
            'SELECT lr.*, e.name as employee_name FROM leave_requests lr LEFT JOIN employees e ON lr.nik = e.nik ORDER BY lr.created_at DESC'
        );
        res.json({ ok: true, data: rows });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Admin: Update Status
router.post('/update-status', requireAuth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ ok: false, error: 'Unauthorized' });
        }
        const { id, status } = req.body;
        await db.execute('UPDATE leave_requests SET status = ? WHERE id = ?', [status, id]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;
