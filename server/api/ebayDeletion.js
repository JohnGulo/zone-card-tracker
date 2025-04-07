router.post('/ebay/deletion', (req, res) => {
  console.log('🔔 Received eBay Deletion Notification');

  // Log the full request
  console.log('HEADERS:', req.headers);
  console.log('BODY:', req.body);

  const token = 'zonecard-token-verify-2025-secure-production-abc123';

  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Content-Length': Buffer.byteLength(token),
  });
  res.end(token);
});