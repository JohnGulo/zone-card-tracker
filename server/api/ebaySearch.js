import express from 'express';
import fetch from 'node-fetch';
import { getEbayAccessToken } from './getEbayAccessToken.js';

const router = express.Router();

// In-memory cache
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

router.get('/search', async (req, res) => {
  const { cardName, gradedOnly, autosOnly } = req.query;
  const cacheKey = `${cardName}-${gradedOnly}-${autosOnly}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    console.log(`✅ Cache hit for: ${cacheKey}`);
    return res.json(cached.data);
  }

  try {
    const EBAY_ACCESS_TOKEN = await getEbayAccessToken();
    console.log("🔑 Using token:", EBAY_ACCESS_TOKEN.substring(0, 20));

    const params = new URLSearchParams({
      q: cardName,
      limit: '100',
      filter: 'conditionIds:{1000},price:[1..100000]'
    });

    const response = await fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${EBAY_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log("📦 Raw eBay response:", JSON.stringify(data, null, 2));

    const items = data.itemSummaries || [];

    if (!items.length) {
      console.warn("⚠️ No items found for card:", cardName);
      return res.json({
        listings: [],
        averages: { raw: 'N/A', psa9: 'N/A', psa10: 'N/A' }
      });
    }

    const rawPrices = [];
    const psa9Prices = [];
    const psa10Prices = [];

    const listings = items
      .map(item => {
        const title = item.title?.toLowerCase() || '';
        const price = parseFloat(item.price?.value || 0);
        const image = item.image?.imageUrl;
        const url = item.itemWebUrl;

        const isPSA10 = title.includes('psa 10');
        const isPSA9 = title.includes('psa 9');
        const isRaw = !title.includes('psa') && !title.includes('bgs') && !title.includes('sgc');
        const isAuto = title.includes('auto');
        const isGraded = title.includes('psa') || title.includes('bgs') || title.includes('sgc');

        if (!isNaN(price)) {
          if (isPSA10) psa10Prices.push(price);
          else if (isPSA9) psa9Prices.push(price);
          else if (isRaw) rawPrices.push(price);
        }

        if ((gradedOnly === 'true' && !isGraded) || (autosOnly === 'true' && !isAuto)) {
          return null;
        }

        return {
          title: item.title,
          price: price.toFixed(2),
          image,
          url
        };
      })
      .filter(Boolean);

    const avg = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 'N/A';

    const responseData = {
      listings,
      averages: {
        raw: avg(rawPrices),
        psa9: avg(psa9Prices),
        psa10: avg(psa10Prices)
      }
    };

    // Cache the result
    cache.set(cacheKey, {
      data: responseData,
      expiresAt: Date.now() + CACHE_TTL
    });

    res.json(responseData);
  } catch (error) {
    console.error('❌ Error fetching eBay data:', error.message);
    res.status(500).json({ error: 'Failed to fetch listing data from eBay.' });
  }
});

export default router;