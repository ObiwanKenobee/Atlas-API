const fs = require('fs');
const path = require('path');
const db = require('../src/db');

async function migrate() {
  const sqlPath = path.resolve(__dirname, 'schema.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('schema.sql not found in db/');
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');
  try {
    console.log('Starting DB migration...');
    await db.query(sql);
    console.log('Migration complete.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(2);
  }
}

if (require.main === module) migrate();
