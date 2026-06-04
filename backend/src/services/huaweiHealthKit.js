const axios = require('axios');

const BASE_URL = 'https://health-api.cloud.huawei.com.sg/healthkit/v1';

async function fetchHealthData(openId, userToken, dataTypeName, startTime, endTime) {
  try {
    const response = await axios.post(
      `${BASE_URL}/sampleSet:polymerize`,
      {
        polyInfo: [
          {
            dataType: {
              name: dataTypeName
            }
          }
        ],
        startTime: startTime,
        endTime: endTime,
        groupByTime: {
          duration: 3600000
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'x-client-id': process.env.HUAWEI_OAUTH_CLIENT_ID,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.group || [];
  } catch (error) {
    console.error(`Error fetching ${dataTypeName}:`, error.response?.data || error.message);
    throw error;
  }
}

function extractHourlyData(groupData, valueKey = 'intVal') {
  const result = Array.from({length: 24}, (_, hour) => ({ hour, value: 0 }));
  
  if (!groupData || !Array.isArray(groupData)) return result;

  for (const group of groupData) {
    const date = new Date(group.startTime);
    const hour = date.getHours();
    
    let val = 0;
    if (group.sampleSet && group.sampleSet.length > 0) {
      const points = group.sampleSet[0].samplePoint;
      if (points && points.length > 0) {
        const values = points[0].value;
        if (values && values.length > 0) {
          val = values[0][valueKey] || values[0]['floatVal'] || 0;
        }
      }
    }
    
    if (hour >= 0 && hour < 24) {
      result[hour].value += val;
    }
  }
  
  return result;
}

async function fetchSteps(openId, userToken, date) {
  const startTime = new Date(date + 'T00:00:00Z').getTime();
  const endTime = new Date(date + 'T23:59:59.999Z').getTime();
  
  const data = await fetchHealthData(
    openId,
    userToken,
    'com.huawei.continuous.steps.delta',
    startTime,
    endTime
  );

  const hourly = extractHourlyData(data, 'intVal');
  return hourly.map(item => ({ hour: item.hour, steps: item.value }));
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

  const hourly = extractHourlyData(data, 'floatVal');
  return hourly.map(item => ({ hour: item.hour, hr: item.value }));
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

  const hourly = extractHourlyData(data, 'floatVal');
  return hourly.map(item => ({ hour: item.hour, cal: item.value }));
}

async function fetchAllData(openId, userToken, date) {
  const [steps, heartRate, calories] = await Promise.all([
    fetchSteps(openId, userToken, date),
    fetchHeartRate(openId, userToken, date),
    fetchCalories(openId, userToken, date),
  ]);
  return { steps, heartRate, calories };
}

module.exports = {
  fetchSteps,
  fetchHeartRate,
  fetchCalories,
  fetchAllData,
  fetchAllDailyData: async (date) => fetchAllData(null, null, date)
};
