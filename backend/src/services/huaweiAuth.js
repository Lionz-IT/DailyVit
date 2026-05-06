const axios = require('axios');

const TOKEN_ENDPOINT = 'https://oauth-login.cloud.huawei.com/oauth2/v3/token';
const REVOKE_ENDPOINT = 'https://oauth-login.cloud.huawei.com/oauth2/v3/revoke';

let cachedToken = null;
let tokenExpiryTime = 0;
let tokenRefreshPromise = null;

async function getAppAccessToken() {
  if (cachedToken && Date.now() < tokenExpiryTime) {
    return cachedToken;
  }

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
  const appId = process.env.HUAWEI_OAUTH_CLIENT_ID;
  const appSecret = process.env.HUAWEI_OAUTH_CLIENT_SECRET;

  if (!appId || !appSecret) {
    throw new Error('Huawei App ID or Secret missing.');
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', appId);
    params.append('client_secret', appSecret);

    const response = await axios.post(TOKEN_ENDPOINT, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000
    });

    cachedToken = response.data.access_token;
    const expiresIn = response.data.expires_in;
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

async function exchangeCodeForToken(code) {
  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.HUAWEI_OAUTH_CLIENT_ID,
      client_secret: process.env.HUAWEI_OAUTH_CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.CALLBACK_URL,
    });

    const response = await axios.post(TOKEN_ENDPOINT, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000
    });

    return response.data;
  } catch (error) {
    console.error('Error exchanging code for token:', error.response?.data || error.message);
    throw error;
  }
}

async function refreshUserToken(refreshTokenStr) {
  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.HUAWEI_OAUTH_CLIENT_ID,
      client_secret: process.env.HUAWEI_OAUTH_CLIENT_SECRET,
      refresh_token: refreshTokenStr,
    });

    const response = await axios.post(TOKEN_ENDPOINT, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000
    });

    return response.data;
  } catch (error) {
    console.error('Error refreshing user token:', error.response?.data || error.message);
    throw error;
  }
}

async function revokeToken(token) {
  try {
    const params = new URLSearchParams({
      token: token,
    });

    await axios.post(REVOKE_ENDPOINT, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000
    });
    return true;
  } catch (error) {
    console.error('Error revoking token:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  getAccessToken: getAppAccessToken, // For backwards compatibility
  getAppAccessToken,
  exchangeCodeForToken,
  refreshUserToken,
  revokeToken
};
