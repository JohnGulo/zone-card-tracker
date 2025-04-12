import express from 'express';
import fetch from 'node-fetch';
import { getEbayAccessToken } from './getEbayAccessToken.js';

const router = express.Router();

// In-memory cache
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

router.get('/marketplace-insights', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const cacheKey = `insights-${query.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    console.log(`✅ [CACHE HIT] Marketplace Insights for: ${query}`);
    return res.json(cached.data);
  }

  try {
    const token = await getEbayAccessToken();

    const endpoint = `https://api.ebay.com/buy/marketplace_insights/v1/item_sales/search?q=${encodeURIComponent(
      query
    )}&filter=sold_status:{SOLD}&limit=50`;

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ eBay API Error:', data);
      return res.status(response.status).json({ error: data });
    }

    const itemSales = (data.itemSales || []).map(item => ({
      title: item.title,
      price: item.price,
      soldDate: item.soldDate,
      image: item.image?.imageUrl || '',
      url: item.itemWebUrl || ''
    }));

    const responseData = { itemSales };

    cache.set(cacheKey, {
      data: responseData,
      expiresAt: Date.now() + CACHE_TTL
    });

    console.log(`✅ [LIVE FETCH] ${itemSales.length} sold items for: ${query}`);
    res.json(responseData);
  } catch (error) {
    console.error('❌ Marketplace Insights fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch from Marketplace Insights API' });
  }
});

export default router;