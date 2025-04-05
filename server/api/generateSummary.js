import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/generate-summary', async (req, res) => {
  const { cardName, prices } = req.body;

  if (!cardName || !prices?.length) {
    return res.status(400).json({ error: 'Card name and prices are required.' });
  }

  const prompt = `
You are a sports card pricing expert. Analyze recent eBay prices for the card "${cardName}":

Prices: [${prices.join(', ')}]

Write a short 2-3 sentence summary that includes:
- The price range
- A quick sale price estimate
- A suggestion or insight for the collector.
Keep it friendly and helpful.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content.trim();
    res.json({ summary: aiResponse });
  } catch (err) {
    console.error('OpenAI error:', err.message);
    res.status(500).json({ error: 'Failed to generate AI summary.' });
  }
});

export default router;
