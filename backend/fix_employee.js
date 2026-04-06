const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function updateEmployee() {
    try {
        const pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'absensi_karyawan',
        });

        const nik = '5297';
        const newPassword = 'pok3mon';
        const hash = await bcrypt.hash(newPassword, 10);
        
        await pool.execute(
            'UPDATE employees SET password = ?, plaintext_password = ?, role = "user", status = "active" WHERE nik = ?',
            [hash, newPassword, nik]
        );
        
        // Verify
        const [rows] = await pool.execute('SELECT nik, name, role, status, plaintext_password FROM employees WHERE nik = ?', [nik]);
        console.log('Updated employee:', rows[0]);
        console.log('New bcrypt hash set for password: ' + newPassword);

        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

updateEmployee();
