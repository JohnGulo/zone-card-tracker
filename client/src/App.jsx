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
  const [allListings, setAllListings] = useState([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [enableAI, setEnableAI] = useState(false);

  const handleGenerate = async () => {
    if (!cardName) return;

    setLoading(true);
    setSummary('');
    setAllListings([]);

    try {
      const res = await fetch(
        'https://zone-card-tracker-production.up.railway.app/api/search?cardName=' +
          encodeURIComponent(cardName)
      );
      const data = await res.json();

      setAllListings(data.listings || []);

      const extractedPrices = data.listings
        .map((item) => parseFloat(item.price))
        .filter((price) => !isNaN(price));

      if (enableAI) {
        const summaryRes = await fetch(
          'https://zone-card-tracker-production.up.railway.app/api/generate-summary',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cardName, prices: extractedPrices })
          }
        );
        const summaryData = await summaryRes.json();
        setSummary(summaryData.summary || 'No summary returned.');
      }
    } catch (err) {
      console.error('Error:', err);
      setSummary('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  const chartPrices = allListings.slice(0, 5).map((item) => parseFloat(item.price) || 0);
  const detailedListings = allListings.slice(5, 25);

  const chartData = {
    labels: chartPrices.map((_, i) => `Sale ${i + 1}`),
    datasets: [
      {
        label: 'Last 5 Sale Prices ($)',
        data: chartPrices,
        borderColor: 'teal',
        backgroundColor: 'lightblue',
        tension: 0.3
      }
    ]
  };

  return (
    <div className="container" style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <h1>Card Pricing Tool</h1>
      <input
        type="text"
        placeholder="Enter card name"
        value={cardName}
        onChange={(e) => setCardName(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      <div style={{ marginBottom: '20px' }}>
        <label>
          <input
            type="checkbox"
            checked={enableAI}
            onChange={() => setEnableAI(!enableAI)}
          />{' '}
          Enable AI-powered summary
        </label>
      </div>
      <button onClick={handleGenerate} style={{ padding: '10px 20px' }}>
        Track Prices
      </button>

      {chartPrices.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <Line data={chartData} />
        </div>
      )}

      {summary && (
        <div
          style={{
            marginTop: '20px',
            backgroundColor: '#eef',
            padding: '15px',
            borderRadius: '5px'
          }}
        >
          <h3>AI-Powered Summary:</h3>
          {loading ? <p>Generating summary...</p> : <p>{summary}</p>}
        </div>
      )}

      {detailedListings.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Recent Listings</h3>
          <ul style={{ padding: 0, listStyle: 'none' }}>
            {detailedListings.map((item, idx) => (
              <li
                key={idx}
                style={{
                  padding: '10px',
                  marginBottom: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
              >
                <strong>{item.title}</strong>
                <br />
                Price: ${item.price}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}