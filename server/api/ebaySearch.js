import express from 'express';
import axios from 'axios';

const router = express.Router();

router.get('/search', async (req, res) => {
  const { cardName, count } = req.query;

  if (!cardName) {
    return res.status(400).json({ error: 'Card name is required.' });
  }

  const endpoint = 'https://svcs.ebay.com/services/search/FindingService/v1';
  const params = {
    'OPERATION-NAME': 'findItemsByKeywords',
    'SERVICE-VERSION': '1.0.0',
    'SECURITY-APPNAME': process.env.EBAY_APP_ID,
    'RESPONSE-DATA-FORMAT': 'JSON',
    'REST-PAYLOAD': true,
    'keywords': cardName,
    'paginationInput.entriesPerPage': count || 100,
    'outputSelector': 'SellerInfo',
  };

  try {
    const response = await axios.get(endpoint, { params });
    const results = response.data.findItemsByKeywordsResponse?.[0]?.searchResult?.[0]?.item || [];

    const listings = results.map((item) => ({
      title: item.title?.[0] || '',
      price: item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || 'N/A',
      condition: item.condition?.[0]?.conditionDisplayName?.[0] || 'Unknown',
      image: item.galleryURL?.[0] || '',
      viewItemURL: item.viewItemURL?.[0] || '',
    }));

    res.json({ listings });
  } catch (err) {
    console.error('eBay fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch data from eBay.' });
  }
});

export default router;
