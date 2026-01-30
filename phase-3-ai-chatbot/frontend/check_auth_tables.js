// Check if Better Auth tables exist in database
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('@neondatabase/serverless');

async function checkTables() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log('🔍 Checking Better Auth tables...\n');

  try {
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('📊 Existing tables:');
    result.rows.forEach(row => console.log(`  - ${row.table_name}`));
    console.log();

    const requiredTables = ['user', 'session', 'account', 'verification'];
    const existingTables = result.rows.map(r => r.table_name);

    const missingTables = requiredTables.filter(t => !existingTables.includes(t));

    if (missingTables.length > 0) {
      console.log('❌ Missing Better Auth tables:');
      missingTables.forEach(t => console.log(`  - ${t}`));
      console.log('\n💡 Better Auth will auto-create these on first auth request.');
    } else {
      console.log('✅ All Better Auth tables exist!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
