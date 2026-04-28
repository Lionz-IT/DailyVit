require('dotenv').config(); // must load before any module that reads process.env

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const db = require('./config/db');
const { runFullSync } = require('./scheduler/syncJob');
const { authenticateToken, loginHandler, createUsersTable } = require('./middleware/auth');

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Terlalu banyak permintaan. Silakan coba lagi dalam 15 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(dateStr) {
  if (!DATE_REGEX.test(dateStr)) return false;
  const d = new Date(dateStr + 'T00:00:00Z');
  return !isNaN(d.getTime()) && d.toISOString().startsWith(dateStr);
}

function parseDate(raw) {
  if (!raw) return new Date().toISOString().split('T')[0];
  const str = String(raw);
  if (!isValidDate(str)) return null;
  return str;
}

app.post('/api/login', loginHandler);

async function initDummyData() {
  try {
    await createUsersTable(db);

    const today = new Date().toISOString().split('T')[0];
    const todayResult = await db.query('SELECT * FROM daily_summary WHERE date = $1', [today]);
    if (todayResult.rows.length === 0) {
      await runFullSync(today);
    }

    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const hasDataResult = await db.query('SELECT * FROM daily_summary WHERE date = $1', [dateStr]);
      if (hasDataResult.rows.length === 0) {
        await runFullSync(dateStr);
      }
    }
  } catch (err) {
    console.error('Error initializing dummy data:', err);
  }
}
initDummyData();

app.get('/api/summary', authenticateToken, async (req, res, next) => {
  try {
    const date = parseDate(req.query.date);
    if (date === null) {
      return res.status(400).json({ success: false, error: 'Format tanggal tidak valid. Gunakan YYYY-MM-DD.' });
    }

    const dataResult = await db.query('SELECT * FROM daily_summary WHERE date = $1', [date]);
    const baselineResult = await db.query('SELECT * FROM user_baseline LIMIT 1');

    const data = dataResult.rows[0];
    const baseline = baselineResult.rows[0] || { avg_steps: 7000, avg_heart_rate: 75, avg_calories: 450 };

    if (!data) {
      return res.json({
        date,
        total_steps: 0,
        total_calories: 0,
        avg_heart_rate: 0,
        smart_insight: "Belum ada data untuk hari ini.",
        baseline
      });
    }

    res.json({
      date: data.date.toISOString().split('T')[0],
      total_steps: data.total_steps,
      total_calories: data.total_calories,
      avg_heart_rate: data.avg_heart_rate,
      smart_insight: data.smart_insight,
      baseline
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/trend', authenticateToken, async (req, res, next) => {
  try {
    const date = parseDate(req.query.date);
    if (date === null) {
      return res.status(400).json({ success: false, error: 'Format tanggal tidak valid. Gunakan YYYY-MM-DD.' });
    }

    const dataResult = await db.query('SELECT * FROM hourly_data WHERE date = $1 ORDER BY hour ASC', [date]);
    const data = dataResult.rows;

    if (!data || data.length === 0) {
      const emptyHourly = Array.from({length: 24}, (_, hour) => ({
        hour, label: `${String(hour).padStart(2,'0')}:00`, steps: 0, heartRate: 0, calories: 0
      }));
      return res.json({ date, hourlyData: emptyHourly });
    }

    const hourlyData = data.map(d => ({
      hour: d.hour,
      label: `${String(d.hour).padStart(2,'0')}:00`,
      steps: d.steps,
      heartRate: d.heart_rate,
      calories: d.calories
    }));

    res.json({ date, hourlyData });
  } catch (error) {
    next(error);
  }
});

app.get('/api/history', authenticateToken, async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    if (days < 1 || days > 90) {
      return res.status(400).json({ success: false, error: 'Parameter days harus antara 1 dan 90.' });
    }

    const dataResult = await db.query(`
      SELECT * FROM daily_summary 
      ORDER BY date DESC 
      LIMIT $1
    `, [days]);

    const data = dataResult.rows.map(row => ({
      ...row,
      date: row.date.toISOString().split('T')[0]
    }));

    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.post('/api/sync', authenticateToken, async (req, res, next) => {
  try {
    const date = parseDate(req.body.date);
    if (date === null) {
      return res.status(400).json({ success: false, error: 'Format tanggal tidak valid. Gunakan YYYY-MM-DD.' });
    }
    await runFullSync(date);
    res.json({ success: true, message: `Sync completed for ${date}` });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, _next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Terjadi kesalahan internal server.'
      : err.message
  });
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    db.pool.end(() => {
      console.log('Database pool closed.');
      process.exit(0);
    });
  });
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
