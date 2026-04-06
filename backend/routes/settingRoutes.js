// d:\absensi-HRD\backend\routes\settingRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM settings WHERE id = 1');
        res.json(rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { defaultStart, defaultEnd, officeLat, officeLng, radiusMeters } = req.body;
        
        let query = `INSERT INTO settings 
        (id, default_start, default_end, office_lat, office_lng, radius_meters) 
        VALUES (1, ?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
        default_start=COALESCE(?, default_start), 
        default_end=COALESCE(?, default_end), 
        office_lat=COALESCE(?, office_lat), 
        office_lng=COALESCE(?, office_lng), 
        radius_meters=COALESCE(?, radius_meters)`;
        
        let params = [
            defaultStart || null, defaultEnd || null, officeLat || null, officeLng || null, radiusMeters || null,
            defaultStart || null, defaultEnd || null, officeLat || null, officeLng || null, radiusMeters || null
        ];

        await db.execute(query, params);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
