const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const overtimeRoutes = require('./routes/overtimeRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const divisionRoutes = require('./routes/divisionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const settingRoutes = require('./routes/settingRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const schedulerRoutes = require('./routes/schedulerRoutes');

const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        console.log(`[CORS Debug] Origin: ${origin}`);

        const allowedOrigins = [
            'http://localhost:3000',
            'https://localhost:3000',
            'http://localhost:3001',
            'https://localhost:3001',
            'http://127.0.0.1:3000',
            'https://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'https://127.0.0.1:3001',
            'https://absenin.online'
        ];

        // Dynamic check for local network IPs (e.g. 192.168.x.x) with any port
        const isLocalNetwork = /^(http|https):\/\/192\.168\.\d+\.\d+(:[0-9]+)?$/.test(origin);

        if (allowedOrigins.indexOf(origin) !== -1 || isLocalNetwork) {
            callback(null, true);
        } else {
            console.error(`Blocked by CORS: ${origin}`);
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded photos as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/overtime', overtimeRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/divisions', divisionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/scheduler', schedulerRoutes);

// Server Time Route
app.get('/api/time', (req, res) => {
    res.json({ iso: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`[Backend] Server running on http://localhost:${PORT}`);
});
