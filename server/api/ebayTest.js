import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/test-ebay', async (req, res) => {
  const { cardName = 'Connor Bedard Young Guns' } = req.query;
  const EBAY_APP_ID = process.env.EBAY_APP_ID;

  const url = `https://svcs.ebay.com/services/search/FindingService/v1?OPERATION-NAME=findCompletedItems&SERVICE-VERSION=1.13.0&SECURITY-APPNAME=${EBAY_APP_ID}&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&keywords=${encodeURIComponent(cardName)}&itemFilter(0).name=SoldItemsOnly&itemFilter(0).value=true&paginationInput.entriesPerPage=10`;

  console.log("🔎 Testing eBay API URL:\n", url);

  try {
    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error('❌ Error in test-ebay route:', error);
    res.status(500).json({ error: 'Failed to reach eBay API' });
  }
});

export default router;