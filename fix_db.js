const db = require('./backend/config/db');

async function fixDb() {
    try {
        console.log('Verifying database schema...');
        
        // 1. Update Role Enum
        console.log('Updating employee roles...');
        await db.execute("ALTER TABLE employees MODIFY COLUMN role ENUM('admin', 'user', 'admin_tj') DEFAULT 'user'");
        console.log('Role enum updated successfully.');

        // 2. Create Table
        console.log('Creating employee_schedules table...');
        await db.execute(`
            CREATE TABLE IF NOT EXISTS employee_schedules (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nik VARCHAR(50) NOT NULL,
                date DATE NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                UNIQUE(nik, date),
                FOREIGN KEY (nik) REFERENCES employees(nik) ON DELETE CASCADE
            )
        `);
        console.log('Table employee_schedules verified/created successfully.');
        
        process.exit(0);
    } catch (err) {
        console.error('Database migration failed:', err);
        process.exit(1);
    }
}

fixDb();
