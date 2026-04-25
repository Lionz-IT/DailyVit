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

    const baselineResult = await db.query('SELECT * FROM user_baseline LIMIT 1');
    const baseline = baselineResult.rows[0] || { avg_steps: 7000, avg_heart_rate: 75, avg_calories: 450 };
    
    const summary = { total_steps: totalSteps, avg_heart_rate: avgHR, total_calories: totalCal };
    const insight = generateSmartInsight(summary, baseline);

    await db.query(`
      INSERT INTO daily_summary (date, total_steps, total_calories, avg_heart_rate, smart_insight, updated_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT(date) DO UPDATE SET
        total_steps = EXCLUDED.total_steps,
        total_calories = EXCLUDED.total_calories,
        avg_heart_rate = EXCLUDED.avg_heart_rate,
        smart_insight = EXCLUDED.smart_insight,
        updated_at = CURRENT_TIMESTAMP
    `, [date, totalSteps, totalCal, avgHR, insight]);

    const hourlyTrend = buildHourlyTrend(cleanedSteps, cleanedHR, cleanedCal);
    
    // Process hourly inserts concurrently
    await Promise.all(hourlyTrend.map(t => 
      db.query(`
        INSERT INTO hourly_data (date, hour, steps, heart_rate, calories)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT(date, hour) DO UPDATE SET
          steps = EXCLUDED.steps,
          heart_rate = EXCLUDED.heart_rate,
          calories = EXCLUDED.calories
      `, [date, t.hour, t.steps, t.heartRate, t.calories])
    ));

    await updateBaseline(db);
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
