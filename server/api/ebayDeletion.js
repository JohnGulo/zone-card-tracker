import express from 'express';
import crypto from 'crypto';
const router = express.Router();

const VERIFICATION_TOKEN = 'zonecard-token-verify-2025-reset-v3-prod-pass';
const ENDPOINT_URL = 'https://zone-card-tracker-production.up.railway.app/api/ebay/deletion';

// ✅ Handle POST — still required
router.post('/ebay/deletion', (req, res) => {
  console.log('🔔 Received POST eBay Deletion Notification');
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Content-Length': Buffer.byteLength(VERIFICATION_TOKEN),
  });
  res.end(VERIFICATION_TOKEN);
});

// ✅ NEW: Handle GET — for eBay challenge
router.get('/ebay/deletion', (req, res) => {
  const challengeCode = req.query.challenge_code;

  if (!challengeCode) {
    return res.status(400).send('Missing challenge_code');
  }

  console.log('🔑 Received eBay GET challenge:', challengeCode);

  const hash = crypto.createHash('sha256');
  hash.update(challengeCode);
  hash.update(VERIFICATION_TOKEN);
  hash.update(ENDPOINT_URL);

  const responseHash = hash.digest('hex');

  res.status(200).json({ challengeResponse: responseHash });
});

export default router;