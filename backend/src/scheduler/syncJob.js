const cron = require('node-cron');
const db = require('../config/db');
const { getMockDailyData, fetchAllDailyData } = require('../services/huaweiHealthKit');
const { cleanSteps, cleanHeartRate, cleanCalories } = require('../services/dataCleansing');
const { aggregateDailySteps, aggregateDailyHeartRate, aggregateDailyCalories, buildHourlyTrend } = require('../services/dataAggregation');
const { generateSmartInsight, updateBaseline } = require('../services/ruleEngine');

// In-memory lock to prevent concurrent syncs for the same user+date
const activeSyncs = new Set();

async function runFullSync(date = new Date().toISOString().split('T')[0], userId = 1) {
  const lockKey = `${userId}:${date}`;
  if (activeSyncs.has(lockKey)) {
    console.log(`Sync already in progress for user ${userId} on ${date}, skipping.`);
    return;
  }

  activeSyncs.add(lockKey);
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const useMock = process.env.USE_MOCK_DATA === 'true';
    let rawSteps, rawHR, rawCal;

    if (useMock) {
      const mockData = getMockDailyData(date);
      rawSteps = mockData.steps;
      rawHR = mockData.heartRate;
      rawCal = mockData.calories;
    } else {
      const realData = await fetchAllDailyData(date);
      rawSteps = realData.steps;
      rawHR = realData.heartRate;
      rawCal = realData.calories;
    }

    const cleanedSteps = cleanSteps(rawSteps);
    const cleanedHR = cleanHeartRate(rawHR);
    const cleanedCal = cleanCalories(rawCal);

    const totalSteps = aggregateDailySteps(cleanedSteps);
    const avgHR = aggregateDailyHeartRate(cleanedHR);
    const totalCal = aggregateDailyCalories(cleanedCal);

    const baselineResult = await client.query('SELECT * FROM user_baseline WHERE user_id = $1', [userId]);
    const baseline = baselineResult.rows[0] || { avg_steps: 7000, avg_heart_rate: 75, avg_calories: 450 };

    const summary = { total_steps: totalSteps, avg_heart_rate: avgHR, total_calories: totalCal };
    const insight = generateSmartInsight(summary, baseline);

    await client.query(`
      INSERT INTO daily_summary (user_id, date, total_steps, total_calories, avg_heart_rate, smart_insight, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, date) DO UPDATE SET
        total_steps = EXCLUDED.total_steps,
        total_calories = EXCLUDED.total_calories,
        avg_heart_rate = EXCLUDED.avg_heart_rate,
        smart_insight = EXCLUDED.smart_insight,
        updated_at = CURRENT_TIMESTAMP
    `, [userId, date, totalSteps, totalCal, avgHR, insight]);

    const hourlyTrend = buildHourlyTrend(cleanedSteps, cleanedHR, cleanedCal);

    for (const t of hourlyTrend) {
      await client.query(`
        INSERT INTO hourly_data (user_id, date, hour, steps, heart_rate, calories)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT(user_id, date, hour) DO UPDATE SET
          steps = EXCLUDED.steps,
          heart_rate = EXCLUDED.heart_rate,
          calories = EXCLUDED.calories
      `, [userId, date, t.hour, t.steps, t.heartRate, t.calories]);
    }

    await updateBaseline(client, userId);
    await client.query('COMMIT');
    console.log(`Sync completed for user ${userId} on ${date}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error during sync for user ${userId} on ${date}:`, error);
    throw error;
  } finally {
    client.release();
    activeSyncs.delete(lockKey);
  }
}

cron.schedule('0 * * * *', async () => {
  console.log(`[${new Date().toISOString()}] Running DailyVit sync job...`);
  try {
    const result = await db.query('SELECT id FROM users');
    const today = new Date().toISOString().split('T')[0];
    for (const user of result.rows) {
      await runFullSync(today, user.id);
    }
  } catch (error) {
    console.error('Scheduled sync failed:', error);
  }
});

module.exports = { runFullSync };
