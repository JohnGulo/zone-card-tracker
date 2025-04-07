import express from 'express';
const router = express.Router();

const VERIFICATION_TOKEN = 'zonecard-token-verify-2025-secure-production-abc123';

router.post('/ebay/deletion', (req, res) => {
  console.log('🔔 Received eBay Deletion Notification');
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Content-Length': Buffer.byteLength(VERIFICATION_TOKEN),
  });
  res.end(VERIFICATION_TOKEN);
});

export default router;