const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { requireAuth, requireAdmin, requireAdminTJ } = require('../middleware/auth');

// GET /employees/me — allows any authenticated user to get their own employee record
router.get('/me', requireAuth, async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT e.*, d.name as division_name FROM employees e LEFT JOIN divisions d ON e.division_id = d.id WHERE e.nik = ?',
            [req.user.nik]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /employees — admin only, returns all employees
router.get('/', requireAuth, requireAdminTJ, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM employees');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const {
            nik, name, password, division, role, status, scheduleType,
            defaultStart, defaultEnd, transportPerDay
        } = req.body;

        // Upsert logic for simple employee management
        const [existing] = await db.execute('SELECT * FROM employees WHERE nik = ?', [nik]);
        
        // Let's resolve division_id
        let divisionId = null;
        if (division) {
            const [divRows] = await db.execute('SELECT id FROM divisions WHERE name = ?', [division]);
            if (divRows.length > 0) {
                divisionId = divRows[0].id;
            } else {
                const [ins] = await db.execute('INSERT INTO divisions (name) VALUES (?)', [division]);
                divisionId = ins.insertId;
            }
        }

        // Hash and Store Plaintext
        const hashedPassword = await bcrypt.hash(password, 10);
        const plaintextPassword = password;

        const values = [
            name,
            hashedPassword, // HASH
            plaintextPassword, // PLAINTEXT
            divisionId,
            role || 'user',
            status || 'active',
            scheduleType || 'fixed',
            defaultStart || null,
            defaultEnd || null,
            transportPerDay || 0,
            nik
        ];

        if (existing.length > 0) {
            await db.execute(`UPDATE employees SET 
                name=?, password=?, plaintext_password=?, division_id=?, role=?, status=?, schedule_type=?, 
                default_start=?, default_end=?, transport_per_day=?
                WHERE nik=?`, values);
        } else {
            await db.execute(`INSERT INTO employees (name, password, plaintext_password, division_id, role, status, 
                schedule_type, default_start, default_end, transport_per_day, nik)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, values);
        }

        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:nik', requireAuth, requireAdmin, async (req, res) => {
    try {
        await db.execute('DELETE FROM employees WHERE nik = ?', [req.params.nik]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
