const axios = require('axios');

let cachedToken = null;
let tokenExpiryTime = 0;
let tokenRefreshPromise = null;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiryTime) {
    return cachedToken;
  }

  // Prevent concurrent refresh — reuse in-flight promise
  if (tokenRefreshPromise) {
    return tokenRefreshPromise;
  }

  tokenRefreshPromise = refreshToken();
  try {
    const token = await tokenRefreshPromise;
    return token;
  } finally {
    tokenRefreshPromise = null;
  }
}

async function refreshToken() {
  const appId = process.env.HUAWEI_APP_ID;
  const appSecret = process.env.HUAWEI_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('Huawei App ID or Secret missing. Set HUAWEI_APP_ID and HUAWEI_APP_SECRET in .env');
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', appId);
    params.append('client_secret', appSecret);

    const response = await axios.post('https://oauth-login.cloud.huawei.com/oauth2/v3/token', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000
    });

    cachedToken = response.data.access_token;
    const expiresIn = response.data.expires_in;
    // Safety margin: refresh early, but guard against unexpectedly small expiry values
    const safetyMargin = Math.min(300, Math.floor(expiresIn * 0.1));
    tokenExpiryTime = Date.now() + (expiresIn - safetyMargin) * 1000;

    return cachedToken;
  } catch (error) {
    cachedToken = null;
    tokenExpiryTime = 0;
    console.error('Error fetching Huawei access token:', error?.response?.data || error.message);
    throw new Error('Failed to authenticate with Huawei API');
  }
}

module.exports = {
  getAccessToken
};
