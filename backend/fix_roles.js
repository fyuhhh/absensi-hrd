const mysql = require('mysql2/promise');

async function fixEmployeeRoles() {
    try {
        const pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'absensi_karyawan',
        });

        // Fix any employees that have NULL or empty role to 'user'
        const [result] = await pool.execute(
            `UPDATE employees SET role = 'user' WHERE (role IS NULL OR role = '') AND nik != 'admin'`
        );
        console.log(`Fixed ${result.affectedRows} employee(s) with missing role.`);

        // Show all employees and their roles for verification
        const [rows] = await pool.execute('SELECT nik, name, role, status FROM employees');
        console.log('\nAll employees:');
        rows.forEach(r => console.log(`  NIK: ${r.nik}, Name: ${r.name}, Role: ${r.role}, Status: ${r.status}`));

        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixEmployeeRoles();
