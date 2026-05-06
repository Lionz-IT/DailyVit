const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const colCheck = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'daily_summary' AND column_name = 'user_id'
    `);
    const tableExists = await client.query(`SELECT to_regclass('public.daily_summary') AS tbl`);
    if (tableExists.rows[0].tbl && colCheck.rows.length === 0) {
      console.log('Migration: dropping old health tables (missing user_id). Data will be reseeded.');
      await client.query('DROP TABLE IF EXISTS hourly_data CASCADE');
      await client.query('DROP TABLE IF EXISTS daily_summary CASCADE');
      await client.query('DROP TABLE IF EXISTS user_baseline CASCADE');
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_summary (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        total_steps INTEGER NOT NULL DEFAULT 0,
        total_calories REAL NOT NULL DEFAULT 0,
        avg_heart_rate REAL NOT NULL DEFAULT 0,
        smart_insight TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
      );

      CREATE TABLE IF NOT EXISTS hourly_data (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
        steps INTEGER NOT NULL DEFAULT 0,
        heart_rate REAL NOT NULL DEFAULT 0,
        calories REAL NOT NULL DEFAULT 0,
        UNIQUE(user_id, date, hour)
      );

      CREATE TABLE IF NOT EXISTS user_baseline (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        avg_steps REAL NOT NULL DEFAULT 7000,
        avg_calories REAL NOT NULL DEFAULT 450,
        avg_heart_rate REAL NOT NULL DEFAULT 75,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_daily_summary_user_date ON daily_summary(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_hourly_data_user_date ON hourly_data(user_id, date);
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS huawei_connections (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        huawei_open_id VARCHAR(255) NOT NULL,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        token_expires_at TIMESTAMP NOT NULL,
        connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );

      CREATE TABLE IF NOT EXISTS oauth_states (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        state VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_oauth_states_created ON oauth_states(created_at);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  runMigrations
};
