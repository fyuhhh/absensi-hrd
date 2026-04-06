const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', // asumsikan default XAMPP
    password: '', // asumsikan default XAMPP tanpa password
    database: 'absensi_karyawan',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
});

module.exports = pool;
