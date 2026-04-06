// d:\absensi-HRD\backend\routes\divisionRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM divisions');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { name } = req.body;
        await db.execute('INSERT IGNORE INTO divisions (name) VALUES (?)', [name]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:name', requireAuth, requireAdmin, async (req, res) => {
    try {
        await db.execute('DELETE FROM divisions WHERE name = ?', [req.params.name]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
