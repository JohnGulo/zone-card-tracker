import fetch from 'node-fetch';

let cachedToken = null;
let tokenExpiration = null;

export async function getEbayAccessToken() {
  const now = Date.now();

  if (cachedToken && tokenExpiration && now < tokenExpiration) {
    return cachedToken; // Return valid cached token
  }

  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

  const encodedCredentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${encodedCredentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope/buy.browse'
  });

  const data = await response.json();

  if (data.access_token) {
    cachedToken = data.access_token;
    tokenExpiration = now + data.expires_in * 1000 - 60000; // refresh 1 min before it expires
    return cachedToken;
  } else {
    throw new Error(`eBay auth failed: ${JSON.stringify(data)}`);
  }
}