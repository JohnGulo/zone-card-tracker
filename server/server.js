import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import ebaySearch from './api/ebaySearch.js';
import generateSummary from './api/generateSummary.js';
import ebayDeletion from './api/ebayDeletion.js';

console.log("OPENAI_API_KEY from .env:", process.env.OPENAI_API_KEY);

const app = express();
app.use(cors({
  origin: '*', // use '*' temporarily to confirm if CORS is the actual blocker
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api', ebaySearch);
app.use('/api', generateSummary);
app.use('/api', ebayDeletion); // ✅ New route added here

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});