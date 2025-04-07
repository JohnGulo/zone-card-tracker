import express from 'express';
const router = express.Router();

const VERIFICATION_TOKEN = 'zonecard-token-verify-2025-secure-production-abc123'; // Same token you'll enter in eBay dashboard

router.post('/ebay/deletion', (req, res) => {
  console.log('🔔 Received eBay Deletion Notification');
  res.send(VERIFICATION_TOKEN);
});

export default router;