import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

import ebaySearch from './api/ebaySearch.js';
import generateSummary from './api/generateSummary.js';
import ebayDeletion from './api/ebayDeletion.js';

console.log("OPENAI_API_KEY from .env:", process.env.OPENAI_API_KEY);

const app = express();

// Required to resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware to parse JSON
app.use(express.json());

// Serve static pages for privacy and success
app.use('/pages', express.static(path.join(__dirname, 'public/pages')));

// API routes
app.use('/api', ebaySearch);
app.use('/api', generateSummary);
app.use('/api', ebayDeletion);

// Optional: redirect clean URLs to static pages
app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/privacy.html'));
});

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/success.html'));
});

app.get('/declined', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/declined.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/pages/about.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

