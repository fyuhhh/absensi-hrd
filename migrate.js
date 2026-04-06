const db = require('./backend/config/db');

async function migrate() {
    try {
        console.log('Starting migration...');
        await db.execute('ALTER TABLE employees ADD COLUMN plaintext_password VARCHAR(255) NULL AFTER password');
        console.log('Migration successful: added plaintext_password column.');
        process.exit(0);
    } catch (err) {
        if (err.code === 'ER_DUP_COLUMN_NAME') {
            console.log('Column already exists, skipping.');
            process.exit(0);
        }
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
