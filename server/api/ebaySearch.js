import express from 'express';
import fetch from 'node-fetch'; // For Node <18, native fetch for Node 18+

const router = express.Router();

const EBAY_ACCESS_TOKEN = process.env.EBAY_ACCESS_TOKEN; // Loaded from Railway or local .env

router.get('/search', async (req, res) => {
  const cardName = req.query.cardName;

  try {
    const response = await fetch(`https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(cardName)}&limit=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${EBAY_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    const listings = data.itemSummaries?.map(item => ({
      title: item.title,
      price: item.price?.value || '0.00'
    })) || [];

    res.json({ listings });
  } catch (error) {
    console.error('Error fetching eBay data:', error);
    res.status(500).json({ error: 'Failed to fetch data from eBay' });
  }
});

export default router;