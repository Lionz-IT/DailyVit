const express = require('express');
const crypto = require('crypto');
const db = require('../config/db');
const { exchangeCodeForToken, revokeToken } = require('../services/huaweiAuth');
const { authenticateToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.get('/auth/huawei', async (req, res, next) => {
  try {
    const state = crypto.randomUUID();
    const tokenStr = req.query.token;
    let userId = null;
    
    if (tokenStr) {
       try {
         const decoded = jwt.verify(tokenStr, process.env.JWT_SECRET);
         userId = decoded.id;
       } catch (e) {
         // ignore parsing error, proceed with null userId
       }
    }

    await db.query(
      'INSERT INTO oauth_states (user_id, state) VALUES ($1, $2)',
      [userId, state]
    );

    const redirectUri = process.env.CALLBACK_URL;
    const clientId = process.env.HUAWEI_OAUTH_CLIENT_ID;
    const scopes = [
      'https://www.huawei.com/healthkit/calories.read',
      'https://www.huawei.com/healthkit/heartrate.read',
      'https://www.huawei.com/healthkit/step.read'
    ].join(' ');

    const huaweiAuthUrl = `https://oauth-login.cloud.huawei.com/oauth2/v3/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(state)}`;
    
    res.redirect(huaweiAuthUrl);
  } catch (error) {
    next(error);
  }
});

router.get('/auth/callback', async (req, res, next) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      return res.status(400).json({ success: false, error: 'Missing code or state parameter' });
    }

    const stateResult = await db.query('SELECT * FROM oauth_states WHERE state = $1', [state]);
    if (stateResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid or expired state parameter' });
    }

    let userId = stateResult.rows[0].user_id;
    if (!userId) {
      const firstUser = await db.query('SELECT id FROM users LIMIT 1');
      if (firstUser.rows.length > 0) {
        userId = firstUser.rows[0].id;
      } else {
        return res.status(400).json({ success: false, error: 'No user to link connection to' });
      }
    }

    await db.query('DELETE FROM oauth_states WHERE state = $1', [state]);

    const tokenData = await exchangeCodeForToken(code);
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in;
    const openId = tokenData.open_id || tokenData.parsed_id_token?.open_id || 'unknown_open_id';
    
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    
    await db.query(`
      INSERT INTO huawei_connections (user_id, huawei_open_id, access_token, refresh_token, token_expires_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id) DO UPDATE SET
        huawei_open_id = EXCLUDED.huawei_open_id,
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        token_expires_at = EXCLUDED.token_expires_at,
        connected_at = CURRENT_TIMESTAMP
    `, [userId, openId, accessToken, refreshToken, expiresAt]);

    const frontendUrl = process.env.FRONTEND_URL || 'https://dailyvit.vercel.app';
    res.redirect(`${frontendUrl}?connected=true`);
  } catch (error) {
    console.error('Error in callback:', error);
    res.status(500).json({ success: false, error: 'Failed to complete OAuth flow' });
  }
});

router.get('/auth/status', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const connection = await db.query('SELECT connected_at FROM huawei_connections WHERE user_id = $1', [userId]);
    
    if (connection.rows.length === 0) {
      return res.json({ connected: false });
    }

    res.json({ connected: true, connectedAt: connection.rows[0].connected_at });
  } catch (error) {
    next(error);
  }
});

router.post('/auth/disconnect', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const connection = await db.query('SELECT access_token FROM huawei_connections WHERE user_id = $1', [userId]);
    
    if (connection.rows.length > 0) {
      try {
        await revokeToken(connection.rows[0].access_token);
      } catch (e) {
        console.error('Failed to revoke token, but removing from DB anyway', e);
      }
      await db.query('DELETE FROM huawei_connections WHERE user_id = $1', [userId]);
    }
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
