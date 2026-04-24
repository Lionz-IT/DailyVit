function cleanHeartRate(hrDataArray) {
  return hrDataArray.filter(d => d.hr >= 30 && d.hr <= 220);
}

function cleanSteps(stepsDataArray) {
  return stepsDataArray.filter(d => d.steps >= 0 && d.steps <= 50000);
}

function cleanCalories(calDataArray) {
  return calDataArray.filter(d => d.cal >= 0 && d.cal <= 5000);
}

module.exports = {
  cleanHeartRate,
  cleanSteps,
  cleanCalories
};
