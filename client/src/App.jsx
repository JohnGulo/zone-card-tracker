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

  const handleGenerate = async () => {
    if (!cardName) return;

    setLoading(true);
    setSummary('');
    setListings([]);
    setErrorMsg('');
    setAverages({ raw: 'N/A', psa9: 'N/A', psa10: 'N/A' });

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
        setSortBy('default'); // Reset to default sort on new search
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
    return 0; // default = most recent (server sorted)
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
        style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        disabled={loading}
      >
        {loading ? 'Loading...' : (<><span>Track Prices</span> <span style={{ fontSize: '18px' }}>📈</span></>)}
      </button>

      {errorMsg && (
        <div style={{ marginTop: '20px', color: 'red', fontWeight: 'bold' }}>
          {errorMsg}
        </div>
      )}

      {(averages.raw !== 'N/A' || averages.psa9 !== 'N/A' || averages.psa10 !== 'N/A') && (
        <div style={{ marginTop: '30px' }}>
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

      {sortedListings.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>
            Sold Market Data <span style={{ fontSize: '14px', color: '#666' }}>({sortedListings.length} sales)</span>
          </h3>

          <div style={{ marginBottom: '15px', textAlign: 'right' }}>
            <label>
              Sort Results By:{' '}
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="default">Most Recent</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
              </select>
            </label>
          </div>

          <ul style={{ padding: 0, listStyle: 'none' }}>
            {sortedListings.map((item, idx) => (
              <li
                key={idx}
                style={{
                  padding: '10px',
                  marginBottom: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}
              >
                {item.image && <img src={item.image} alt="card" style={{ width: '80px', height: 'auto' }} />}
                <div>
                  <strong>{item.title}</strong>
                  <div style={{ color: 'green', fontSize: '20px', fontWeight: 'bold' }}>
                    ${item.price}
                  </div>
                  {item.date && (
                    <div style={{ fontSize: '14px', color: '#555' }}>
                      Sold on: {formatDate(item.date)}
                    </div>
                  )}
                  {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer">View on eBay</a>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}