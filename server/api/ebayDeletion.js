import express from 'express';
const router = express.Router();

const VERIFICATION_TOKEN = 'zonecard-token-verify-2025-secure-production-abc123';

router.post('/ebay/deletion', (req, res) => {
  console.log('🔔 Received eBay Deletion Notification');
  res.set('Content-Type', 'text/plain');
  res.status(200).send('zonecard-token-verify-2025-secure-production-abc123');
});

export default router;