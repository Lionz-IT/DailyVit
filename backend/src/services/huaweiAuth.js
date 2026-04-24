const axios = require('axios');

let cachedToken = null;
let tokenExpiryTime = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiryTime) {
    return cachedToken;
  }

  const appId = process.env.HUAWEI_APP_ID;
  const appSecret = process.env.HUAWEI_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('Huawei App ID or Secret missing');
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', appId);
    params.append('client_secret', appSecret);

    const response = await axios.post('https://oauth-login.cloud.huawei.com/oauth2/v3/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    cachedToken = response.data.access_token;
    // Expire 5 minutes before actual expiry just to be safe
    tokenExpiryTime = Date.now() + (response.data.expires_in - 300) * 1000;
    
    return cachedToken;
  } catch (error) {
    console.error('Error fetching Huawei access token:', error?.response?.data || error.message);
    throw new Error('Failed to authenticate with Huawei API');
  }
}

module.exports = {
  getAccessToken
};
