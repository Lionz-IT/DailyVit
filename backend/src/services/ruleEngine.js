function generateSmartInsight(todaySummary, baseline) {
  const { total_steps, avg_heart_rate } = todaySummary;

  const baseSteps = (baseline && baseline.avg_steps > 0) ? baseline.avg_steps : 7000;
  const baseHR = (baseline && baseline.avg_heart_rate > 0) ? baseline.avg_heart_rate : 75;

  const stepRatio = total_steps / baseSteps;
  const hrRatio = avg_heart_rate / baseHR;

  // Trend Deviation
  let trendDeviation = { en: "Your activity trend is normal.", id: "Tren aktivitas Anda normal." };
  if (stepRatio < 0.5) {
    trendDeviation = {
      en: "Warning: Your activity is significantly below baseline.",
      id: "Peringatan: Aktivitas Anda jauh di bawah rata-rata."
    };
  } else if (stepRatio >= 1.2) {
    trendDeviation = {
      en: "Great job! Your activity is well above your baseline.",
      id: "Kerja bagus! Aktivitas Anda jauh di atas rata-rata."
    };
  }

  // Health Status
  let healthStatus = { en: "Your heart rate is within normal ranges.", id: "Detak jantung Anda dalam batas normal." };
  if (hrRatio > 1.1) {
    healthStatus = {
      en: "Warning: Your heart rate is elevated without exercise.",
      id: "Peringatan: Detak jantung Anda meningkat tanpa olahraga."
    };
  }

  // Daily Target
  let targetSteps = Math.round(baseSteps * 1.05);
  if (targetSteps < 3000) targetSteps = 3000;
  if (targetSteps > 15000) targetSteps = 15000;

  let dailyTarget = {
    en: `Your daily target is ${targetSteps} steps.`,
    id: `Target harian Anda adalah ${targetSteps} langkah.`
  };

  return { trendDeviation, healthStatus, dailyTarget };
}

async function updateBaseline(client, userId) {
  const result = await client.query(`
    SELECT AVG(total_steps) as avg_steps, 
           AVG(avg_heart_rate) as avg_hr, 
           AVG(total_calories) as avg_cal
    FROM daily_summary 
    WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '7 days'
  `, [userId]);

  const last7days = result.rows[0];

  if (last7days && last7days.avg_steps !== null) {
    await client.query(`
      INSERT INTO user_baseline (user_id, avg_steps, avg_heart_rate, avg_calories, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        avg_steps = EXCLUDED.avg_steps,
        avg_heart_rate = EXCLUDED.avg_heart_rate,
        avg_calories = EXCLUDED.avg_calories,
        updated_at = CURRENT_TIMESTAMP
    `, [userId, last7days.avg_steps, last7days.avg_hr, last7days.avg_cal]);
  }
}

module.exports = {
  generateSmartInsight,
  updateBaseline
};
