import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/search', async (req, res) => {
  const cardName = req.query.cardName;

  const endpoint = 'https://svcs.ebay.com/services/search/FindingService/v1';
  const ebayAppId = process.env.EBAY_CLIENT_ID; // This is your AppID, not the OAuth token

  try {
    const response = await fetch(`${endpoint}?OPERATION-NAME=findCompletedItems&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=${ebayAppId}&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&keywords=${encodeURIComponent(cardName)}&itemFilter(0).name=SoldItemsOnly&itemFilter(0).value=true&sortOrder=EndTimeSoonest&paginationInput.entriesPerPage=50`, {
      method: 'GET'
    });

    const data = await response.json();
    const items = data.findCompletedItems?.searchResult?.[0]?.item || [];

    const rawPrices = [];
    const psa9Prices = [];
    const psa10Prices = [];

    const listings = items.map(item => {
      const title = item.title[0].toLowerCase();
      const price = parseFloat(item.sellingStatus[0].currentPrice[0].__value__ || 0);

      if (!isNaN(price)) {
        if (title.includes('psa 10')) psa10Prices.push(price);
        else if (title.includes('psa 9')) psa9Prices.push(price);
        else if (!title.includes('psa') && !title.includes('bgs')) rawPrices.push(price);
      }

      return {
        title: item.title[0],
        price: price.toFixed(2)
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
    res.status(500).json({ error: 'Failed to fetch sold data from eBay' });
  }
});

export default router;