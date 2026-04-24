const cron = require('node-cron');
const db = require('../config/db');
const { getMockDailyData } = require('../services/huaweiHealthKit');
const { cleanSteps, cleanHeartRate, cleanCalories } = require('../services/dataCleansing');
const { aggregateDailySteps, aggregateDailyHeartRate, aggregateDailyCalories, buildHourlyTrend } = require('../services/dataAggregation');
const { generateSmartInsight, updateBaseline } = require('../services/ruleEngine');

async function runFullSync(date = new Date().toISOString().split('T')[0]) {
  try {
    const useMock = process.env.USE_MOCK_DATA === 'true';
    let rawSteps, rawHR, rawCal;

    if (useMock) {
      const mockData = getMockDailyData(date);
      rawSteps = mockData.steps;
      rawHR = mockData.heartRate;
      rawCal = mockData.calories;
    } else {
      // Implement real fetch here
    }

    const cleanedSteps = cleanSteps(rawSteps);
    const cleanedHR = cleanHeartRate(rawHR);
    const cleanedCal = cleanCalories(rawCal);

    const totalSteps = aggregateDailySteps(cleanedSteps);
    const avgHR = aggregateDailyHeartRate(cleanedHR);
    const totalCal = aggregateDailyCalories(cleanedCal);

    const baseline = db.prepare('SELECT * FROM user_baseline LIMIT 1').get() || { avg_steps: 7000, avg_heart_rate: 75, avg_calories: 450 };
    
    const summary = { total_steps: totalSteps, avg_heart_rate: avgHR, total_calories: totalCal };
    const insight = generateSmartInsight(summary, baseline);

    db.prepare(`
      INSERT INTO daily_summary (date, total_steps, total_calories, avg_heart_rate, smart_insight, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(date) DO UPDATE SET
        total_steps = excluded.total_steps,
        total_calories = excluded.total_calories,
        avg_heart_rate = excluded.avg_heart_rate,
        smart_insight = excluded.smart_insight,
        updated_at = datetime('now')
    `).run(date, totalSteps, totalCal, avgHR, insight);

    const hourlyTrend = buildHourlyTrend(cleanedSteps, cleanedHR, cleanedCal);
    const insertHourly = db.prepare(`
      INSERT INTO hourly_data (date, hour, steps, heart_rate, calories)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(date, hour) DO UPDATE SET
        steps = excluded.steps,
        heart_rate = excluded.heart_rate,
        calories = excluded.calories
    `);

    const insertMany = db.transaction((trends) => {
      for (const t of trends) {
        insertHourly.run(date, t.hour, t.steps, t.heartRate, t.calories);
      }
    });
    insertMany(hourlyTrend);

    updateBaseline(db);
    console.log(`Sync completed for ${date}`);
  } catch (error) {
    console.error('Error during sync:', error);
  }
}

cron.schedule('0 * * * *', async () => {
  console.log(`[${new Date().toISOString()}] Running DailyVit sync job...`);
  await runFullSync();
});

module.exports = { runFullSync };
