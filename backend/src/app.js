const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const { runFullSync } = require('./scheduler/syncJob');

require('dotenv').config();

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json());

// Run sync on startup for today if no data exists
const today = new Date().toISOString().split('T')[0];
const todayData = db.prepare('SELECT * FROM daily_summary WHERE date = ?').get(today);
if (!todayData) {
  runFullSync(today);
}

// Ensure 7 days of mock data exists
for (let i = 1; i <= 7; i++) {
  const d = new Date();
  d.setDate(d.getDate() - i);
  const dateStr = d.toISOString().split('T')[0];
  const hasData = db.prepare('SELECT * FROM daily_summary WHERE date = ?').get(dateStr);
  if (!hasData) {
    runFullSync(dateStr);
  }
}

app.get('/api/summary', (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const data = db.prepare('SELECT * FROM daily_summary WHERE date = ?').get(date);
    const baseline = db.prepare('SELECT * FROM user_baseline LIMIT 1').get() || { avg_steps: 7000, avg_heart_rate: 75, avg_calories: 450 };

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
      date: data.date,
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

app.get('/api/trend', (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const data = db.prepare('SELECT * FROM hourly_data WHERE date = ? ORDER BY hour ASC').all(date);

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

app.get('/api/history', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const data = db.prepare(`
      SELECT * FROM daily_summary 
      ORDER BY date DESC 
      LIMIT ?
    `).all(days);
    
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
