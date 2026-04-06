const db = require('./backend/config/db');
const bcrypt = require('bcrypt');

async function fix() {
    try {
        const password = 'admin';
        const hash = await bcrypt.hash(password, 10);
        await db.execute('UPDATE employees SET password = ?, plaintext_password = ? WHERE nik = "admin"', [hash, password]);
        console.log('Admin password hashed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Failed to fix admin password:', err);
        process.exit(1);
    }
}

fix();
