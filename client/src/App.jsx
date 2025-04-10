import React, { useState } from 'react';

export default function App() {
  const [cardName, setCardName] = useState('');
  const [listings, setListings] = useState([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [enableAI, setEnableAI] = useState(false);
  const [gradedOnly, setGradedOnly] = useState(false);
  const [autosOnly, setAutosOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [averages, setAverages] = useState({ raw: 'N/A', psa9: 'N/A', psa10: 'N/A' });
  const [errorMsg, setErrorMsg] = useState('');
  const [showTips, setShowTips] = useState(false);
  const [resultCount, setResultCount] = useState(0);

  const handleGenerate = async () => {
    if (!cardName) return;

    setLoading(true);
    setSummary('');
    setListings([]);
    setErrorMsg('');
    setAverages({ raw: 'N/A', psa9: 'N/A', psa10: 'N/A' });
    setResultCount(0);

    try {
      const queryParams = new URLSearchParams({
        cardName,
        gradedOnly: gradedOnly.toString(),
        autosOnly: autosOnly.toString()
      });

      const res = await fetch(
        `https://zone-card-tracker-production.up.railway.app/api/search?${queryParams}`
      );
      const data = await res.json();

      if (!data.listings || data.listings.length === 0) {
        setErrorMsg("No results found. Please check the card name spelling or try another search.");
      } else {
        setListings(data.listings);
        setAverages(data.averages);
        setResultCount(data.count || data.listings.length);
        setSortBy('default');
      }

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
      setErrorMsg('Something went wrong. Please try again later.');
    }

    setLoading(false);
  };

  const sortedListings = [...listings].sort((a, b) => {
    if (sortBy === 'price-asc') return parseFloat(a.price) - parseFloat(b.price);
    if (sortBy === 'price-desc') return parseFloat(b.price) - parseFloat(a.price);
    return 0;
  });

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="container" style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <h1>Zone Card Tracker</h1>

      <label htmlFor="cardInput" style={{ fontWeight: 'bold' }}>Enter Card Name</label>
      <input
        id="cardInput"
        type="text"
        placeholder="e.g. 2023 Topps Chrome Luis Robert"
        value={cardName}
        onChange={(e) => setCardName(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />

      <div style={{ marginBottom: '10px' }}>
        <span
          onClick={() => setShowTips(!showTips)}
          style={{
            fontSize: '14px',
            color: '#007BFF',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {showTips ? 'Hide Search Tips' : 'Show Search Tips'}
        </span>
        {showTips && (
          <div style={{ fontSize: '14px', backgroundColor: '#f9f9f9', padding: '10px', border: '1px solid #ddd', marginTop: '6px', borderRadius: '4px' }}>
            Be as specific as possible. Include years, product names, variation names, or card numbering (e.g., "/150") to get more accurate and faster analysis results.
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '10px' }}>
        <label><input type="checkbox" checked={gradedOnly} onChange={() => setGradedOnly(!gradedOnly)} /> Graded Cards Only</label>
        <label><input type="checkbox" checked={autosOnly} onChange={() => setAutosOnly(!autosOnly)} /> Autos Only</label>
      </div>

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

      <button
        onClick={handleGenerate}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          backgroundColor: loading ? '#0056b3' : '#007BFF',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.3s ease'
        }}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-ring" />
            Loading...
          </>
        ) : 'Track Prices 📈'}
      </button>

      {errorMsg && (
        <div style={{ marginTop: '20px', color: 'red', fontWeight: 'bold' }}>
          {errorMsg}
        </div>
      )}

      {(averages.raw !== 'N/A' || averages.psa9 !== 'N/A' || averages.psa10 !== 'N/A') && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ marginTop: '25px', textAlign: 'center' }}>Sold Market Summary</h3>
          <p style={{ textAlign: 'center', marginTop: '-10px', fontStyle: 'italic', fontSize: '14px' }}>
            based on sold listings below
          </p>
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

      {summary