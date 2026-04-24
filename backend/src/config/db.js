const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../../data/dailyvit.db');

// Ensure data directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize database schema
db.exec(`
  -- Daily aggregated health summary
  CREATE TABLE IF NOT EXISTS daily_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,              -- "YYYY-MM-DD"
    total_steps INTEGER DEFAULT 0,         -- SUM of steps
    total_calories REAL DEFAULT 0,         -- SUM of calories (kcal)
    avg_heart_rate REAL DEFAULT 0,         -- AVG of heart rate (bpm)
    smart_insight TEXT,                    -- Generated insight string
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- Hourly data points for trend chart
  CREATE TABLE IF NOT EXISTS hourly_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,                    -- "YYYY-MM-DD"
    hour INTEGER NOT NULL,                 -- 0-23
    steps INTEGER DEFAULT 0,              -- steps in this hour
    heart_rate REAL DEFAULT 0,            -- avg HR in this hour
    calories REAL DEFAULT 0,              -- calories in this hour
    UNIQUE(date, hour)
  );

  -- User baseline (rolling 7-day average)
  CREATE TABLE IF NOT EXISTS user_baseline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    avg_steps REAL DEFAULT 7000,
    avg_calories REAL DEFAULT 450,
    avg_heart_rate REAL DEFAULT 75,
    updated_at TEXT DEFAULT (datetime('now'))
  );
`);

// Insert default baseline if not exists
const baselineCount = db.prepare('SELECT COUNT(*) as count FROM user_baseline').get().count;
if (baselineCount === 0) {
  db.prepare('INSERT INTO user_baseline (avg_steps, avg_calories, avg_heart_rate) VALUES (?, ?, ?)')
    .run(7000, 450, 75);
}

module.exports = db;
