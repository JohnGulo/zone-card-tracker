import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/search', async (req, res) => {
  const cardName = req.query.cardName;
  const gradedOnly = req.query.gradedOnly === 'true';
  const autosOnly = req.query.autosOnly === 'true';
  const sortOrder = req.query.sortOrder || 'EndTimeSoonest';
  const ebayAppId = process.env.EBAY_CLIENT_ID;

  try {
    const endpoint = 'https://svcs.ebay.com/services/search/FindingService/v1';

    const params = new URLSearchParams({
      'OPERATION-NAME': 'findCompletedItems',
      'SERVICE-VERSION': '1.13.0',
      'SECURITY-APPNAME': ebayAppId,
      'RESPONSE-DATA-FORMAT': 'JSON',
      'REST-PAYLOAD': 'true',
      'keywords': cardName,
      'paginationInput.entriesPerPage': '100',
      'sortOrder': sortOrder
    });

    // Add item filter for sold listings
    params.append('itemFilter(0).name', 'SoldItemsOnly');
    params.append('itemFilter(0).value', 'true');

    const response = await fetch(`${endpoint}?${params}`);
    const data = await response.json();

    const items = data.findCompletedItemsResponse?.[0]?.searchResult?.[0]?.item || [];

    if (!items || items.length === 0) {
      console.warn("⚠️ No items found for card:", cardName);
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
      .filter(item => {
        const title = item.title?.[0]?.toLowerCase() || '';
        const isGraded = title.includes('psa') || title.includes('bgs') || title.includes('sgc');
        const isAuto = title.includes('auto');

        return (!gradedOnly || isGraded) && (!autosOnly || isAuto);
      })
      .map(item => {
        const title = item.title?.[0] || '';
        const lowerTitle = title.toLowerCase();
        const price = parseFloat(item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || 0);

        if (!isNaN(price)) {
          if (lowerTitle.includes('psa 10')) psa10Prices.push(price);
          else if (lowerTitle.includes('psa 9')) psa9Prices.push(price);
          else if (!lowerTitle.includes('psa') && !lowerTitle.includes('bgs') && !lowerTitle.includes('sgc')) rawPrices.push(price);
        }

        return {
          title,
          price: price.toFixed(2),
          image: item.galleryURL?.[0] || '',
          url: item.viewItemURL?.[0] || ''
        };
      });

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