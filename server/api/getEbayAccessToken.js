// server/api/getEbayAccessToken.js
import fetch from 'node-fetch';

let cachedToken = null;
let tokenExpiry = 0;

export async function getEbayAccessToken() {
  const now = Date.now();

  if (cachedToken && tokenExpiry > now) {
    return cachedToken;
  }

  const credentials = `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`;
  const encoded = Buffer.from(credentials).toString('base64');

  try {
    const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encoded}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/buy.browse'
    });

    const data = await response.json();

    if (data.access_token) {
      cachedToken = data.access_token;
      tokenExpiry = now + (data.expires_in * 1000) - 60000;
      console.log('🔑 New eBay token acquired');
      return cachedToken;
    } else {
      throw new Error('❌ Token fetch failed: ' + JSON.stringify(data));
    }
  } catch (err) {
    console.error('❌ OAuth error:', err.message);
    throw err;
  }
}