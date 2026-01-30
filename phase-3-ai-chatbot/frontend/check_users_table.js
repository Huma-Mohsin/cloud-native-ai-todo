// Check users table structure
require('dotenv').config({ path: '.env.local' });
const { Pool } = require('@neondatabase/serverless');

async function checkUsersTable() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log('🔍 Checking users table structure...\n');

  try {
    // Check users table columns
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    console.log('📊 Users table columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    console.log();

    // Check if there are any users
    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`👥 Total users: ${countResult.rows[0].count}\n`);

    // Check sessions table
    const sessionsResult = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'sessions'
      ORDER BY ordinal_position
    `);

    console.log('📊 Sessions table columns:');
    sessionsResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

checkUsersTable();
