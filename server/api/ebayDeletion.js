import express from 'express';
const router = express.Router();

const VERIFICATION_TOKEN = 'zonecard-token-verify-2025-reset-v3-prod-pass';

router.post('/ebay/deletion', (req, res) => {
  console.log('🔔 Received eBay Deletion Notification');

  // Log full request
  try {
    console.log('HEADERS:', req.headers);
    console.log('BODY:', JSON.stringify(req.body || {}));
  } catch (err) {
    console.error('Error logging request body:', err);
  }

  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Content-Length': Buffer.byteLength(VERIFICATION_TOKEN),
  });
  res.end(VERIFICATION_TOKEN);
});

// ✅ This fixes the Railway crash
export default router;