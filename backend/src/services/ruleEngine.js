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
    return "\u26a0\ufe0f Aktivitasmu sangat rendah hari ini namun detak jantungmu lebih tinggi dari biasanya. Pastikan kamu cukup beristirahat dan terhidrasi. Jika merasa tidak nyaman, pertimbangkan untuk konsultasi ke dokter.";
  }

  if (stepRatio < 0.4) {
    return "\ud83e\ude91 Kamu kurang bergerak hari ini. Coba luangkan 10\u201315 menit untuk berjalan santai \u2014 aktivitas ringan pun sangat membantu menjaga kesehatan jantung dan metabolisme.";
  }

  if (stepRatio >= 1.3 && hrRatio <= 1.15) {
    return "\ud83c\udf1f Luar biasa! Aktivitasmu hari ini jauh melampaui rata-rata harianmu. Jangan lupa istirahat yang cukup dan pastikan tubuhmu pulih dengan baik.";
  }

  if (stepRatio >= 1.0 && stepRatio < 1.3) {
    return "\u2705 Aktivitasmu hari ini sudah baik dan sesuai targetmu. Pertahankan pola ini untuk menjaga kesehatan jangka panjang!";
  }

  if (stepRatio >= 0.4 && stepRatio < 0.7) {
    return "\ud83d\udcc8 Aktivitasmu hari ini sedikit di bawah rata-rata harianmu. Coba tambahkan sedikit gerakan di sore hari untuk mendekati targetmu.";
  }

  if (hrRatio > 1.3 && stepRatio < 0.5) {
    return "\ud83d\udc93 Detak jantungmu hari ini lebih tinggi dari biasanya meski aktivitasmu rendah. Pastikan kamu cukup minum air putih dan mendapat istirahat yang berkualitas malam ini.";
  }

  return "\ud83d\ude0a Hari ini aktivitasmu berjalan normal. Tetap jaga pola makan seimbang dan tidur yang cukup untuk mempertahankan kondisi kesehatanmu!";
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
