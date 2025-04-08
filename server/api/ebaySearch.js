import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/search', async (req, res) => {
  const { cardName, gradedOnly, autosOnly, sortOrder } = req.query;
  const ebayAppId = process.env.EBAY_CLIENT_ID;

  try {
    const endpoint = 'https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findCompletedItems';
    const params = new URLSearchParams({
      'SERVICE-VERSION': '1.13.0',
      'SECURITY-APPNAME': ebayAppId,
      'RESPONSE-DATA-FORMAT': 'JSON',
      'REST-PAYLOAD': 'true',
      'keywords': cardName,
      'paginationInput.entriesPerPage': '50',
      'sortOrder': sortOrder || 'EndTimeSoonest',
      'itemFilter(0).name': 'SoldItemsOnly',
      'itemFilter(0).value': 'true'
    });

    const response = await fetch(`${endpoint}&${params}`);
    const data = await response.json();

    const items = data.findCompletedItemsResponse?.[0]?.searchResult?.[0]?.item || [];

    if (!items || items.length === 0) {
      console.warn("\u26A0\uFE0F No items found for card:", cardName);
      return res.json({
        listings: [],
        averages: {
          raw: 'N/A',
          psa9: 'N/A',
          psa10: 'N/A'
        }
      });
    }

    const rawPrices = [];
    const psa9Prices = [];
    const psa10Prices = [];

    const listings = items
      .map(item => {
        const title = item.title?.[0]?.toLowerCase() || '';
        const price = parseFloat(item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || 0);
        const image = item.galleryURL?.[0];
        const url = item.viewItemURL?.[0];

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

        // Apply grading/autograph filter
        if ((gradedOnly === 'true' && !isGraded) || (autosOnly === 'true' && !isAuto)) {
          return null;
        }

        return {
          title: item.title?.[0] || '',
          price: price.toFixed(2),
          image,
          url
        };
      })
      .filter(Boolean);

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
    console.error('❌ Error fetching eBay sold data:', error.message);
    res.status(500).json({ error: 'Failed to fetch sold listing data from eBay.' });
  }
});

export default router;