const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const { runFullSync } = require('./scheduler/syncJob');

require('dotenv').config();

const app = express();
// Allow CORS for local development and the deployed Vercel domain.
// In production, you might want to read this from an environment variable.
app.use(cors({ 
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    /^https:\/\/.*\.vercel\.app$/ // Allows any Vercel domain
  ] 
}));
app.use(express.json());

// Initialize dummy data asynchronously
async function initDummyData() {
  try {
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
// Run the init function
initDummyData();

app.get('/api/summary', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
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
      date: data.date.toISOString().split('T')[0], // format date from postgres
      total_steps: data.total_steps,
      total_calories: data.total_calories,
      avg_heart_rate: data.avg_heart_rate,
      smart_insight: data.smart_insight,
      baseline
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/trend', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
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
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const dataResult = await db.query(`
      SELECT * FROM daily_summary 
      ORDER BY date DESC 
      LIMIT $1
    `, [days]);
    
    // Format dates before sending
    const data = dataResult.rows.map(row => ({
      ...row,
      date: row.date.toISOString().split('T')[0]
    }));
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/sync', async (req, res) => {
  try {
    const date = req.body.date || new Date().toISOString().split('T')[0];
    await runFullSync(date);
    res.json({ success: true, message: `Sync completed for ${date}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
