import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

import generateSummary from './api/generateSummary.js';
import ebayDeletion from './api/ebayDeletion.js';
import marketplaceInsights from './api/marketplaceInsights.js';
import ebaySearch from './api/ebaySearch.js'; // ✅ New: add this line

console.log("OPENAI_API_KEY from .env:", process.env.OPENAI_API_KEY);

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static HTML pages
app.use('/pages', express.static(path.join(__dirname, 'public/pages')));

// ✅ Mount API routes
app.use('/api', generateSummary);
app.use('/api', ebayDeletion);
app.use('/api', marketplaceInsights);
app.use('/api', ebaySearch); // ✅ New: mounts /api/search route

// Static route redirects
app.get('/privacy', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/privacy.html')));
app.get('/success', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/success.html')));
app.get('/declined', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/declined.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public/pages/about.html')));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});