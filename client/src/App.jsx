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
  const [enableAI, setEnableAI] = useState(false);
  const [firstFive, setFirstFive] = useState([]);
  const [otherListings, setOtherListings] = useState([]);

  const handleGenerate = async () => {
    if (!cardName) return;

    setLoading(true);
    setSummary('');
    setPrices([]);
    setFirstFive([]);
    setOtherListings([]);

    try {
      const searchRes = await fetch(
        'https://zone-card-tracker-production.up.railway.app/api/search?cardName=' +
          encodeURIComponent(cardName)
      );
      const searchData = await searchRes.json();

      const listings = searchData.listings || [];

      const extractedPrices = listings
        .slice(0, 5)
        .map((item) => parseFloat(item.price))
        .filter((price) => !isNaN(price));

      setPrices(extractedPrices);
      setFirstFive(listings.slice(0, 5));
      setOtherListings(listings.slice(5));

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

  const chartData = {
    labels: prices.map((_, i) => `Listing ${i + 1}`),
    datasets: [
      {
        label: 'Price ($)',
        data: prices,
        borderColor: 'teal',
        backgroundColor: 'lightblue',
        tension: 0.3
      }
    ]
  };

  return (
    <div className="container" style={{ maxWidth: '800px', margin: 'auto' }}>
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
          />
          Enable AI-powered summary
        </label>
      </div>
      <button onClick={handleGenerate} style={{ padding: '10px 20px' }}>
        Track Prices
      </button>

      {prices.length > 0 && (
        <>
          <div style={{ marginTop: '30px' }}>
            <Line data={chartData} />
          </div>

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
        </>
      )}

      {otherListings.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3>More Recent Sales</h3>
          {otherListings.map((item, idx) => (
            <div
              key={idx}
              style={{
                borderBottom: '1px solid #ccc',
                padding: '10px 0'
              }}
            >
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <strong>{item.title}</strong>
              </a>
              <p style={{ margin: 0 }}>
                💰 ${item.price.toFixed(2)} — {item.condition}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}