router.post('/ebay/deletion', (req, res) => {
  console.log('🔔 Received eBay Deletion Notification');

  // Safely log request data
  try {
    console.log('HEADERS:', req.headers);
    console.log('BODY:', JSON.stringify(req.body || {}));
  } catch (err) {
    console.error('Error logging request body:', err);
  }

  const token = 'zonecard-token-verify-2025-secure-production-abc123';

  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Content-Length': Buffer.byteLength(token),
  });
  res.end(token);
});