const { Pool } = require('pg');

const sslConfig = process.env.NODE_ENV === 'production'
  ? { rejectUnauthorized: true }
  : { rejectUnauthorized: false };

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : sslConfig
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      -- Daily aggregated health summary
      CREATE TABLE IF NOT EXISTS daily_summary (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL UNIQUE,              -- "YYYY-MM-DD"
        total_steps INTEGER DEFAULT 0,         
        total_calories REAL DEFAULT 0,         
        avg_heart_rate REAL DEFAULT 0,         
        smart_insight TEXT,                    
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Hourly data points for trend chart
      CREATE TABLE IF NOT EXISTS hourly_data (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,                    
        hour INTEGER NOT NULL,                 
        steps INTEGER DEFAULT 0,              
        heart_rate REAL DEFAULT 0,            
        calories REAL DEFAULT 0,              
        UNIQUE(date, hour)
      );

      -- User baseline (rolling 7-day average)
      CREATE TABLE IF NOT EXISTS user_baseline (
        id SERIAL PRIMARY KEY,
        avg_steps REAL DEFAULT 7000,
        avg_calories REAL DEFAULT 450,
        avg_heart_rate REAL DEFAULT 75,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert default baseline if not exists
    const result = await client.query('SELECT COUNT(*) as count FROM user_baseline');
    if (parseInt(result.rows[0].count) === 0) {
      await client.query(
        'INSERT INTO user_baseline (avg_steps, avg_calories, avg_heart_rate) VALUES ($1, $2, $3)',
        [7000, 450, 75]
      );
    }
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    client.release();
  }
}

initDB();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
