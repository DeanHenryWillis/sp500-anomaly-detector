import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://sp500-anomaly-detector-api.onrender.com/anomalies')
      .then(res => { setAnomalies(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'sans-serif',color:'#64748b'}}>Loading anomalies...</div>;

  return <Dashboard anomalies={anomalies} />;
}

export default App;

