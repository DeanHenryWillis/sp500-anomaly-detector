import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 85) { clearInterval(intervalRef.current); return 85; }
        return prev + Math.random() * 4;
      });
    }, 300);

    axios.get('https://sp500-anomaly-detector-api.onrender.com/anomalies')
      .then(res => {
        clearInterval(intervalRef.current);
        setProgress(100);
        setTimeout(() => {
          setAnomalies(res.data);
          setLoading(false);
        }, 400);
      })
      .catch(err => {
        clearInterval(intervalRef.current);
        console.error(err);
        setLoading(false);
      });

    return () => clearInterval(intervalRef.current);
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'Inter', -apple-system, sans-serif", background: '#f8fafc' }}>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', letterSpacing: '0.05em' }}>
        Loading anomaly data...
      </p>
      <div style={{ width: '260px', height: '4px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: '#0f172a',
          borderRadius: '999px',
          transition: 'width 0.3s ease'
        }} />
      </div>
      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '12px' }}>
        {progress < 30 ? 'Waking up server...' : progress < 60 ? 'Fetching anomalies...' : progress < 85 ? 'Almost there...' : 'Finalizing...'}
      </p>
    </div>
  );

  return <Dashboard anomalies={anomalies} />;
}

export default App;
