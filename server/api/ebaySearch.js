import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

const EBAY_ACCESS_TOKEN = process.env.EBAY_ACCESS_TOKEN;

router.get('/search', async (req, res) => {
  const cardName = req.query.cardName;

  try {
    const response = await fetch(
      `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(cardName)}&filter=soldItemsOnly:true&limit=25`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${EBAY_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const data = await response.json();

    const listings = (data.itemSummaries || []).map(item => ({
      title: item.title,
      price: parseFloat(item.price?.value || 0),
      condition: item.condition || 'N/A',
      url: item.itemWebUrl,
      image: item.image?.imageUrl || ''
    }));

    res.json({ listings });
  } catch (err) {
    console.error('❌ eBay API error:', err);
    res.status(500).json({ error: 'Failed to fetch eBay data' });
  }
});

export default router;