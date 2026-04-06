const db = require('./config/db');
const bcrypt = require('bcrypt');

async function updateAdmin() {
    try {
        const nik = 'admin';
        const password = 'admin0912';
        const hash = await bcrypt.hash(password, 10);
        
        const [rows] = await db.execute('SELECT * FROM employees WHERE nik = ?', [nik]);
        
        if (rows.length > 0) {
            await db.execute(
                'UPDATE employees SET password = ?, plaintext_password = ?, role = "admin", status = "active" WHERE nik = ?',
                [hash, password, nik]
            );
            console.log('Admin account updated successfully.');
        } else {
            await db.execute(
                'INSERT INTO employees (nik, name, password, plaintext_password, role, status, division_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [nik, 'Administrator', hash, password, 'admin', 'active', null]
            );
            console.log('Admin account created successfully.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Failed to update admin account:', err);
        process.exit(1);
    }
}

updateAdmin();
