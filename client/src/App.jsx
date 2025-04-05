import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale, Tooltip, Legend);

export default function App() {
  const [cardName, setCardName] = useState('');
  const [prices, setPrices] = useState([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const mockPrices = [4.99, 5.99, 6.49, 7.00, 5.25, 6.10];

  const handleGenerate = async () => {
  if (!cardName) return;

  setLoading(true);
  setSummary('');
  setPrices([]);

  try {
    // Step 1: Fetch listings from your backend
    const searchRes = await fetch('http://localhost:5000/api/search?cardName=' + encodeURIComponent(cardName));
    const searchData = await searchRes.json();

    const extractedPrices = searchData.listings
      .map(item => parseFloat(item.price))
      .filter(price => !isNaN(price));

    setPrices(extractedPrices);

    // Step 2: Send prices to OpenAI summary endpoint
    const summaryRes = await fetch('http://localhost:5000/api/generate-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardName, prices: extractedPrices })
    });

    const summaryData = await summaryRes.json();
    setSummary(summaryData.summary || 'No summary returned.');
  } catch (err) {
    console.error('Error:', err);
    setSummary('Something went wrong. Please try again.');
  }

  setLoading(false);
};


  const chartData = {
    labels: prices.map((_, i) => `Listing ${i + 1}`),
    datasets: [{
      label: 'Price ($)',
      data: prices,
      borderColor: 'teal',
      backgroundColor: 'lightblue',
      tension: 0.3
    }]
  };

  return (
    <div className="container">
      <h1>Card Pricing Tool</h1>
      <input
        type="text"
        placeholder="Enter card name"
        value={cardName}
        onChange={(e) => setCardName(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      <button onClick={handleGenerate} style={{ padding: '10px 20px' }}>
        Generate AI Summary
      </button>

      {prices.length > 0 && (
        <>
          <div style={{ marginTop: '30px' }}>
            <Line data={chartData} />
          </div>

          <div style={{ marginTop: '20px', backgroundColor: '#eef', padding: '15px', borderRadius: '5px' }}>
            <h3>AI-Powered Summary:</h3>
            {loading ? <p>Generating summary...</p> : <p>{summary}</p>}
          </div>
        </>
      )}
    </div>
  );
}