function generateSmartInsight(todaySummary, baseline) {
  const { total_steps, avg_heart_rate, total_calories } = todaySummary;

  // Guard against division by zero — use safe defaults when baseline is 0 or missing
  const baseSteps = baseline.avg_steps > 0 ? baseline.avg_steps : 7000;
  const baseHR = baseline.avg_heart_rate > 0 ? baseline.avg_heart_rate : 75;
  const baseCal = baseline.avg_calories > 0 ? baseline.avg_calories : 450;

  const stepRatio  = total_steps / baseSteps;
  const hrRatio    = avg_heart_rate / baseHR;
  const calRatio   = total_calories / baseCal;

  if (stepRatio < 0.3 && hrRatio > 1.2) {
    return "\u26a0\ufe0f Your activity is very low today but your heart rate is higher than usual. Make sure you rest and stay hydrated. If you feel unwell, consider consulting a doctor.";
  }

  if (stepRatio < 0.4) {
    return "\ud83e\ude91 You haven't moved much today. Try taking a 10\u201315 minute walk \u2014 even light activity helps maintain heart health and metabolism.";
  }

  if (stepRatio >= 1.3 && hrRatio <= 1.15) {
    return "\ud83c\udf1f Outstanding! Your activity today far exceeds your daily average. Don't forget to rest enough and let your body recover well.";
  }

  if (stepRatio >= 1.0 && stepRatio < 1.3) {
    return "\u2705 Your activity today is good and meets your target. Keep up this pattern to maintain long-term health!";
  }

  if (stepRatio >= 0.4 && stepRatio < 0.7) {
    return "\ud83d\udcc8 Your activity today is slightly below your daily average. Try adding some movement in the afternoon to get closer to your target.";
  }

  if (hrRatio > 1.3 && stepRatio < 0.5) {
    return "\ud83d\udc93 Your heart rate today is higher than usual despite low activity. Make sure you drink enough water and get quality rest tonight.";
  }

  return "\ud83d\ude0a Your activity today is normal. Keep maintaining a balanced diet and adequate sleep to sustain your health condition!";
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
