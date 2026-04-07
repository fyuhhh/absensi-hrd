const jwt = require('jsonwebtoken');
const JWT_SECRET = 'supersecret_absensi_hrd_2026';

function requireAuth(req, res, next) {
    const token = req.cookies.token || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
    
    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('[Auth Error]', err.message);
            return res.status(403).json({ error: 'Failed to authenticate token' });
        }
        req.user = decoded;
        next();
    });
}

function requireAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
}

function requireAdminTJ(req, res, next) {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'admin_tj')) {
        next();
    } else {
        res.status(403).json({ error: 'Admin or Admin_TJ access required' });
    }
}

module.exports = { requireAuth, requireAdmin, requireAdminTJ };
