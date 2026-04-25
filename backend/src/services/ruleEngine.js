function generateSmartInsight(todaySummary, baseline) {
  const { total_steps, avg_heart_rate, total_calories } = todaySummary;
  const stepRatio  = total_steps / (baseline.avg_steps || 7000);
  const hrRatio    = avg_heart_rate / (baseline.avg_heart_rate || 75);
  const calRatio   = total_calories / (baseline.avg_calories || 450);

  if (stepRatio < 0.3 && hrRatio > 1.2) {
    return "⚠️ Aktivitasmu sangat rendah hari ini namun detak jantungmu lebih tinggi dari biasanya. Pastikan kamu cukup beristirahat dan terhidrasi. Jika merasa tidak nyaman, pertimbangkan untuk konsultasi ke dokter.";
  }

  if (stepRatio < 0.4) {
    return "🪑 Kamu kurang bergerak hari ini. Coba luangkan 10–15 menit untuk berjalan santai — aktivitas ringan pun sangat membantu menjaga kesehatan jantung dan metabolisme.";
  }

  if (stepRatio >= 1.3 && hrRatio <= 1.15) {
    return "🌟 Luar biasa! Aktivitasmu hari ini jauh melampaui rata-rata harianmu. Jangan lupa istirahat yang cukup dan pastikan tubuhmu pulih dengan baik.";
  }

  if (stepRatio >= 1.0 && stepRatio < 1.3) {
    return "✅ Aktivitasmu hari ini sudah baik dan sesuai targetmu. Pertahankan pola ini untuk menjaga kesehatan jangka panjang!";
  }

  if (stepRatio >= 0.4 && stepRatio < 0.7) {
    return "📈 Aktivitasmu hari ini sedikit di bawah rata-rata harianmu. Coba tambahkan sedikit gerakan di sore hari untuk mendekati targetmu.";
  }

  if (hrRatio > 1.3 && stepRatio < 0.5) {
    return "💓 Detak jantungmu hari ini lebih tinggi dari biasanya meski aktivitasmu rendah. Pastikan kamu cukup minum air putih dan mendapat istirahat yang berkualitas malam ini.";
  }

  return "😊 Hari ini aktivitasmu berjalan normal. Tetap jaga pola makan seimbang dan tidur yang cukup untuk mempertahankan kondisi kesehatanmu!";
}

async function updateBaseline(db) {
  const result = await db.query(`
    SELECT AVG(total_steps) as avg_steps, 
           AVG(avg_heart_rate) as avg_hr, 
           AVG(total_calories) as avg_cal
    FROM daily_summary 
    WHERE date >= CURRENT_DATE - INTERVAL '7 days'
  `);

  const last7days = result.rows[0];

  if (last7days && last7days.avg_steps) {
    await db.query(`
      UPDATE user_baseline SET 
        avg_steps = $1, avg_heart_rate = $2, avg_calories = $3, 
        updated_at = CURRENT_TIMESTAMP
    `, [last7days.avg_steps, last7days.avg_hr, last7days.avg_cal]);
  }
}

module.exports = {
  generateSmartInsight,
  updateBaseline
};
