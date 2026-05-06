const axios = require('axios');

const BASE_URL = 'https://health-api.cloud.huawei.com/healthkit/v1';

async function fetchHealthData(openId, userToken, dataTypeName, startTime, endTime) {
  try {
    const response = await axios.post(
      `${BASE_URL}/sampleSet:daily?dataTypeName=${dataTypeName}`,
      {
        startTime,
        endTime,
        pageSize: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'x-user-id': openId,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.sampleSet || [];
  } catch (error) {
    console.error(`Error fetching ${dataTypeName}:`, error.response?.data || error.message);
    throw error;
  }
}

async function fetchSteps(openId, userToken, date) {
  const startTime = new Date(date + 'T00:00:00Z').getTime();
  const endTime = new Date(date + 'T23:59:59.999Z').getTime();
  
  const data = await fetchHealthData(
    openId,
    userToken,
    'com.huawei.continuous.steps.total',
    startTime,
    endTime
  );

  return Array.from({length: 24}, (_, hour) => {
    return { hour, steps: 0 }; 
  });
}

async function fetchHeartRate(openId, userToken, date) {
  const startTime = new Date(date + 'T00:00:00Z').getTime();
  const endTime = new Date(date + 'T23:59:59.999Z').getTime();
  
  const data = await fetchHealthData(
    openId,
    userToken,
    'com.huawei.continuous.heart.rate',
    startTime,
    endTime
  );

  return Array.from({length: 24}, (_, hour) => ({ hour, hr: 0 }));
}

async function fetchCalories(openId, userToken, date) {
  const startTime = new Date(date + 'T00:00:00Z').getTime();
  const endTime = new Date(date + 'T23:59:59.999Z').getTime();
  
  const data = await fetchHealthData(
    openId,
    userToken,
    'com.huawei.continuous.calories.burnt',
    startTime,
    endTime
  );

  return Array.from({length: 24}, (_, hour) => ({ hour, cal: 0 }));
}

async function fetchAllData(openId, userToken, date) {
  const [steps, heartRate, calories] = await Promise.all([
    fetchSteps(openId, userToken, date),
    fetchHeartRate(openId, userToken, date),
    fetchCalories(openId, userToken, date),
  ]);
  return { steps, heartRate, calories };
}

function getMockData(date) {
  let seed = 0;
  for (let i = 0; i < date.length; i++) {
    seed += date.charCodeAt(i);
  }

  const seededRandom = (hour, offset = 0) => {
    const x = Math.sin(seed + hour + offset) * 10000;
    return x - Math.floor(x);
  };

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
        : 0 
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
  fetchAllData,
  getMockData,
  getMockDailyData: getMockData,
  fetchAllDailyData: async (date) => fetchAllData(null, null, date)
};
