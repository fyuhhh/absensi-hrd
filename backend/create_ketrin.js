const db = require('./config/db');
const bcrypt = require('bcrypt');

async function createKetrin() {
    try {
        const nik = 'ketrin';
        const name = 'Ketrin';
        const password = 'ketrinnn';
        const role = 'admin_tj';
        
        console.log(`Creating user ${name} with NIK ${nik} and role ${role}...`);

        // Check if user already exists
        const [existing] = await db.execute('SELECT * FROM employees WHERE nik = ?', [nik]);
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [divisions] = await db.execute('SELECT id FROM divisions LIMIT 1');
        const divisionId = divisions.length > 0 ? divisions[0].id : null;

        const values = [
            name,
            hashedPassword,
            password, // plaintext_password
            divisionId,
            role,
            'active',
            'fixed',
            '09:00:00',
            '15:00:00',
            25000,
            nik
        ];

        if (existing.length > 0) {
            console.log('User already exists. Updating...');
            await db.execute(`UPDATE employees SET 
                name=?, password=?, plaintext_password=?, division_id=?, role=?, status=?, schedule_type=?, 
                default_start=?, default_end=?, transport_per_day=?
                WHERE nik=?`, values);
            console.log('User updated successfully.');
        } else {
            await db.execute(`INSERT INTO employees (name, password, plaintext_password, division_id, role, status, 
                schedule_type, default_start, default_end, transport_per_day, nik)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, values);
            console.log('User created successfully.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Failed to create user:', err);
        process.exit(1);
    }
}

createKetrin();
