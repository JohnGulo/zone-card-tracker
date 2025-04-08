// App.jsx
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
  const [listings, setListings] = useState([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [enableAI, setEnableAI] = useState(false);
  const [averages, setAverages] = useState({ raw: 'N/A', psa9: 'N/A', psa10: 'N/A' });
  const [gradedOnly, setGradedOnly] = useState(false);
  const [autosOnly, setAutosOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState('EndTimeSoonest');

  const handleGenerate = async () => {
    if (!cardName) return;

    setLoading(true);
    setSummary('');
    setListings([]);
    setAverages({ raw: 'N/A', psa9: 'N/A', psa10: 'N/A' });

    try {
      const res = await fetch(
        `https://zone-card-tracker-production.up.railway.app/api/search?cardName=${encodeURIComponent(
          cardName
        )}&gradedOnly=${gradedOnly}&autosOnly=${autosOnly}&sortOrder=${sortOrder}`
      );
      const data = await res.json();
      setListings(data.listings || []);
      setAverages(data.averages || { raw: 'N/A', psa9: 'N/A', psa10: 'N/A' });

      const extractedPrices = data.listings
        .slice(0, 5)
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

  const chartPrices = listings.slice(0, 5).map((item) => parseFloat(item.price) || 0);
  const detailedListings = listings.slice(5);

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
    <div className="container" style={{ maxWidth: 900, margin: '0 auto', padding: '20px' }}>
      <h1>Zone Card Tracker</h1>

      <label htmlFor="cardInput" style={{ fontWeight: 'bold' }}>Enter Card Name</label>
      <input
        id="cardInput"
        type="text"
        placeholder="e.g. 2024 Jackson Holliday Topps Chrome Auto"
        value={cardName}
        onChange={(e) => setCardName(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />

      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <label>
          <input type="checkbox" checked={gradedOnly} onChange={() => setGradedOnly(!gradedOnly)} />
          Graded Cards Only
        </label>
        <label>
          <input type="checkbox" checked={autosOnly} onChange={() => setAutosOnly(!autosOnly)} />
          Autos Only
        </label>
        <label>
          Sort By:
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="EndTimeSoonest">End Time Soonest</option>
            <option value="PricePlusShippingHighest">Price: High to Low</option>
            <option value="PricePlusShippingLowest">Price: Low to High</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={enableAI} onChange={() => setEnableAI(!enableAI)} />
          Enable AI-powered summary
        </label>
      </div>

      <button
        onClick={handleGenerate}
        style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        disabled={loading}
      >
        {loading ? 'Loading...' : (<><span>Track Prices</span> <span style={{ fontSize: '18px' }}>📈</span></>)}
      </button>

      {chartPrices.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <Line data={chartData} />

          <h3 style={{ marginTop: '25px', textAlign: 'center' }}>Sold Market Summary</h3>
          <div
            style={{
              marginTop: '10px',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              backgroundColor: '#f4f4f4',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #ccc'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>Raw Avg</div>
              <div style={{ fontSize: '22px', color: '#333' }}>${averages.raw}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '500' }}>PSA 9 Avg</div>
              <div style={{ fontSize: '22px', color: '#444' }}>${averages.psa9}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#d6336c' }}>PSA 10 Avg</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#d6336c' }}>${averages.psa10}</div>
            </div>
          </div>
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
          <h3>Sold Market Data</h3>
          <ul style={{ padding: 0, listStyle: 'none' }}>
            {detailedListings.map((item, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '10px',
                  marginBottom: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px'
                }}
              >
                {item.image && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <img src={item.image} alt="eBay" style={{ width: '80px', height: 'auto', borderRadius: '4px' }} />
                  </a>
                )}
                <div>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <strong>{item.title}</strong>
                  </a>
                  <br />
                  <span style={{ fontSize: '20px', color: 'green', fontWeight: 'bold' }}>
                    ${item.price}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}