function cleanHeartRate(hrDataArray) {
  if (!Array.isArray(hrDataArray)) {
    console.warn('[DataCleansing] cleanHeartRate received non-array input, returning empty array.');
    return [];
  }
  const before = hrDataArray.length;
  const cleaned = hrDataArray.filter(d => d && typeof d.hr === 'number' && d.hr >= 30 && d.hr <= 220);
  const removed = before - cleaned.length;
  if (removed > 0) {
    console.log(`[DataCleansing] cleanHeartRate: filtered ${removed}/${before} readings (out of range or invalid).`);
  }
  return cleaned;
}

function cleanSteps(stepsDataArray) {
  if (!Array.isArray(stepsDataArray)) {
    console.warn('[DataCleansing] cleanSteps received non-array input, returning empty array.');
    return [];
  }
  const before = stepsDataArray.length;
  const cleaned = stepsDataArray.filter(d => d && typeof d.steps === 'number' && d.steps >= 0 && d.steps <= 50000);
  const removed = before - cleaned.length;
  if (removed > 0) {
    console.log(`[DataCleansing] cleanSteps: filtered ${removed}/${before} readings (out of range or invalid).`);
  }
  return cleaned;
}

function cleanCalories(calDataArray) {
  if (!Array.isArray(calDataArray)) {
    console.warn('[DataCleansing] cleanCalories received non-array input, returning empty array.');
    return [];
  }
  const before = calDataArray.length;
  const cleaned = calDataArray.filter(d => d && typeof d.cal === 'number' && d.cal >= 0 && d.cal <= 5000);
  const removed = before - cleaned.length;
  if (removed > 0) {
    console.log(`[DataCleansing] cleanCalories: filtered ${removed}/${before} readings (out of range or invalid).`);
  }
  return cleaned;
}

module.exports = {
  cleanHeartRate,
  cleanSteps,
  cleanCalories
};
