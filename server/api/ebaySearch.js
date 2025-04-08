import express from 'express';
import fetch from 'node-fetch';
import { getEbayAccessToken } from './utils/getEbayAccessToken.js';

const router = express.Router();

router.get('/search', async (req, res) => {
  const cardName = req.query.cardName;

  try {
    const EBAY_ACCESS_TOKEN = await getEbayAccessToken();

    const response = await fetch(
      `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(cardName)}&limit=100&filter=conditions:{1000}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${EBAY_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    const rawPrices = [];
    const psa9Prices = [];
    const psa10Prices = [];

    const listings = data.itemSummaries?.map(item => {
      const title = item.title.toLowerCase();
      const price = parseFloat(item.price?.value || 0);

      if (!isNaN(price)) {
        if (title.includes('psa 10')) psa10Prices.push(price);
        else if (title.includes('psa 9')) psa9Prices.push(price);
        else if (!title.includes('psa') && !title.includes('bgs')) rawPrices.push(price);
      }

      return {
        title: item.title,
        price: price.toFixed(2)
      };
    }) || [];

    const avg = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 'N/A';

    res.json({
      listings,
      averages: {
        raw: avg(rawPrices),
        psa9: avg(psa9Prices),
        psa10: avg(psa10Prices)
      }
    });
  } catch (error) {
    console.error('Error fetching eBay data:', error);
    res.status(500).json({ error: 'Failed to fetch data from eBay' });
  }
});

export default router;