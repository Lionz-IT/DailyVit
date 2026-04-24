const { getAccessToken } = require('./huaweiAuth');
const axios = require('axios');

async function fetchSteps(startTime, endTime) {
  // Placeholder for real API
  return [];
}

async function fetchHeartRate(startTime, endTime) {
  // Placeholder for real API
  return [];
}

async function fetchCalories(startTime, endTime) {
  // Placeholder for real API
  return [];
}

async function fetchAllDailyData(date) {
  const startTime = new Date(date + 'T00:00:00').getTime();
  const endTime = new Date(date + 'T23:59:59').getTime();
  const [steps, heartRate, calories] = await Promise.all([
    fetchSteps(startTime, endTime),
    fetchHeartRate(startTime, endTime),
    fetchCalories(startTime, endTime),
  ]);
  return { steps, heartRate, calories };
}

function getMockDailyData(date) {
  // Use the date string as a simple seed to make data consistent per day, 
  // but let it slowly increase throughout the day to simulate syncing.
  
  // Create a pseudo-random seed based on the date string
  let seed = 0;
  for (let i = 0; i < date.length; i++) {
    seed += date.charCodeAt(i);
  }
  
  // Simple seeded random function
  const seededRandom = (hour, offset = 0) => {
    const x = Math.sin(seed + hour + offset) * 10000;
    return x - Math.floor(x);
  };

  // Get current hour so we don't generate future data for today
  const isToday = date === new Date().toISOString().split('T')[0];
  const currentHour = isToday ? new Date().getHours() : 23;

  return {
    steps: Array.from({length: 24}, (_, hour) => ({
      hour,
      steps: (hour >= 7 && hour <= 22 && hour <= currentHour)
        ? Math.floor(seededRandom(hour, 1) * 800 + (hour === 8 || hour === 12 || hour === 18 ? 600 : 100))
        : 0
    })),
    heartRate: Array.from({length: 24}, (_, hour) => ({
      hour,
      hr: (hour <= currentHour)
        ? (hour >= 6 
          ? Math.floor(65 + seededRandom(hour, 2) * 30 + (hour === 8 || hour === 18 ? 15 : 0))
          : Math.floor(55 + seededRandom(hour, 3) * 10))
        : 0 // No heart rate for future hours
    })),
    calories: Array.from({length: 24}, (_, hour) => ({
      hour,
      cal: (hour >= 7 && hour <= currentHour) ? Math.floor(seededRandom(hour, 4) * 30 + 5) : 0
    }))
  };
}

module.exports = {
  fetchSteps,
  fetchHeartRate,
  fetchCalories,
  fetchAllDailyData,
  getMockDailyData
};
