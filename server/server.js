import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import ebaySearch from './api/ebaySearch.js';
import generateSummary from './api/generateSummary.js';
import ebayDeletion from './api/ebayDeletion.js';

console.log("OPENAI_API_KEY from .env:", process.env.OPENAI_API_KEY);

const app = express();
app.use(cors({
  origin: 'https://zone-card-tracker-client-production.up.railway.app'
}));
app.use(express.json());

app.use('/api', ebaySearch);
app.use('/api', generateSummary);
app.use('/api', ebayDeletion); // ✅ New route added here

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});