const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function updateAdmin() {
    try {
        const pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'absensi_karyawan',
        });

        const nik = 'admin';
        const password = 'admin0912';
        const hash = await bcrypt.hash(password, 10);
        
        const [rows] = await pool.execute('SELECT * FROM employees WHERE nik = ?', [nik]);
        
        if (rows.length > 0) {
            await pool.execute(
                'UPDATE employees SET password = ?, plaintext_password = ?, role = "admin", status = "active" WHERE nik = ?',
                [hash, password, nik]
            );
            console.log('Admin account updated successfully.');
        } else {
            await pool.execute(
                'INSERT INTO employees (nik, name, password, plaintext_password, role, status, division_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [nik, 'Administrator', hash, password, 'admin', 'active', null]
            );
            console.log('Admin account created successfully.');
        }
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('Failed to update admin account:', err);
        process.exit(1);
    }
}

updateAdmin();
