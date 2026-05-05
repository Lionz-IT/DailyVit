function aggregateDailySteps(hourlySteps) {
  if (hourlySteps.length === 0) return 0;
  return hourlySteps.reduce((sum, d) => sum + d.steps, 0);
}

function aggregateDailyCalories(hourlyCalories) {
  if (hourlyCalories.length === 0) return 0;
  return parseFloat(hourlyCalories.reduce((sum, d) => sum + d.cal, 0).toFixed(1));
}

function aggregateDailyHeartRate(hourlyHR) {
  const validReadings = hourlyHR.filter(d => d.hr > 0);
  if (validReadings.length === 0) return 0;
  return parseFloat((validReadings.reduce((sum, d) => sum + d.hr, 0) / validReadings.length).toFixed(1));
}

function buildHourlyTrend(steps, heartRate, calories) {
  return Array.from({length: 24}, (_, hour) => ({
    hour,
    label: `${String(hour).padStart(2,'0')}:00`,
    steps: steps.find(d => d.hour === hour)?.steps || 0,
    heartRate: heartRate.find(d => d.hour === hour)?.hr || 0,
    calories: calories.find(d => d.hour === hour)?.cal || 0,
  }));
}

module.exports = {
  aggregateDailySteps,
  aggregateDailyCalories,
  aggregateDailyHeartRate,
  buildHourlyTrend
};
