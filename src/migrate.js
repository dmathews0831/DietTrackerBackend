import dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function runMigration() {
  console.log('Running migration...');
  
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS diet_logs (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        food_name TEXT NOT NULL,
        notes TEXT,
        logged_at TIMESTAMP DEFAULT NOW() NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
    
    console.log('✅ Migration completed successfully!');
    console.log('Table "diet_logs" created.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
  
  process.exit(0);
}

runMigration();