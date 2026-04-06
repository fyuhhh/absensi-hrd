const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function verifyLogin() {
    try {
        const pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'absensi_karyawan',
        });

        const nik = '5297';
        const testPassword = 'pok3mon';
        
        const [rows] = await pool.execute(
            'SELECT nik, name, role, status, password, plaintext_password FROM employees WHERE nik = ?',
            [nik]
        );
        
        if (rows.length === 0) {
            console.log('Employee not found!');
        } else {
            const emp = rows[0];
            console.log('Found employee:', emp.nik, emp.name, emp.role, emp.status);
            console.log('Plaintext in DB:', emp.plaintext_password);
            console.log('Hash in DB:', emp.password);
            
            const match = await bcrypt.compare(testPassword, emp.password);
            console.log(`bcrypt.compare("${testPassword}", hash) =`, match);
            
            // Also try matching with plaintext_password from DB
            if (!match) {
                const matchPlain = await bcrypt.compare(emp.plaintext_password, emp.password);
                console.log(`bcrypt.compare(plaintextFromDB, hash) =`, matchPlain);
            }
        }

        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

verifyLogin();
