const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'supersecret_absensi_hrd_2026';

router.post('/login', async (req, res) => {
    try {
        const { nik, password } = req.body;
        
        const [rows] = await db.execute('SELECT * FROM employees WHERE nik = ? AND status = "active"', [nik]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ ok: false, error: 'NIK atau password salah / akun nonaktif' });
        }

        const bcrypt = require('bcrypt');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ ok: false, error: 'NIK atau password salah / akun nonaktif' });
        }

        const token = jwt.sign(
            { nik: user.nik, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Set token in HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.json({
            ok: true,
            user: {
                nik: user.nik,
                name: user.name,
                role: user.role,
                division: user.division_id,
                transportPerDay: user.transport_per_day,
                status: user.status,
                scheduleType: user.schedule_type,
                defaultStart: user.default_start,
                defaultEnd: user.default_end
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ ok: true });
});

module.exports = router;
