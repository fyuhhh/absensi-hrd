/**
 * Migration Script: Convert Base64 photos in database to file-based storage
 * 
 * Usage: node migrate_photos.js
 * 
 * This script will:
 * 1. Find all attendance records with Base64 in_photo data
 * 2. Save each photo as a .jpg file in the uploads/ folder
 * 3. Update the database record to store the file path instead
 * 
 * Safe to run multiple times - it skips records that are already migrated.
 */

const db = require('./config/db');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function migrate() {
    console.log('🔄 Starting photo migration...');
    console.log(`📁 Uploads directory: ${UPLOADS_DIR}`);
    
    try {
        // Get all attendance records that have in_photo data
        const [rows] = await db.execute(
            'SELECT id, nik, date, in_photo FROM attendance WHERE in_photo IS NOT NULL AND in_photo != ""'
        );
        
        console.log(`📋 Found ${rows.length} records with photos`);
        
        let migrated = 0;
        let skipped = 0;
        let errors = 0;
        
        for (const row of rows) {
            // Skip if already migrated (starts with /uploads/)
            if (row.in_photo && row.in_photo.startsWith('/uploads/')) {
                skipped++;
                continue;
            }
            
            // Skip if it's not Base64 data
            if (!row.in_photo || (!row.in_photo.startsWith('data:') && row.in_photo.length < 100)) {
                skipped++;
                continue;
            }
            
            try {
                // Strip the data:image/jpeg;base64, prefix
                const base64Clean = row.in_photo.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Clean, 'base64');
                
                const dateStr = row.date ? row.date.split('T')[0] : 'unknown';
                const filename = `${row.nik}_${dateStr}_${row.id}.jpg`;
                const filepath = path.join(UPLOADS_DIR, filename);
                
                // Save file
                fs.writeFileSync(filepath, buffer);
                
                // Update database
                const photoPath = `/uploads/${filename}`;
                await db.execute('UPDATE attendance SET in_photo = ? WHERE id = ?', [photoPath, row.id]);
                
                migrated++;
                console.log(`  ✅ Migrated: ${filename} (${(buffer.length / 1024).toFixed(1)}KB)`);
            } catch (err) {
                errors++;
                console.error(`  ❌ Error migrating ID ${row.id}: ${err.message}`);
            }
        }
        
        console.log('');
        console.log('📊 Migration Summary:');
        console.log(`   ✅ Migrated: ${migrated}`);
        console.log(`   ⏭️  Skipped (already done): ${skipped}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log('');
        console.log('🎉 Migration complete!');
        
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    }
    
    process.exit(0);
}

migrate();
