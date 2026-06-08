import React, { useState } from 'react';
import AnomalyTable from './AnomalyTable';

export default function Dashboard({ anomalies }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('return_zscore');

  const totalAnomalies = anomalies.length;
  const avgReturnZ = (anomalies.reduce((s, r) => s + Math.abs(r.return_zscore), 0) / anomalies.length).toFixed(2);
  const avgVolZ = (anomalies.reduce((s, r) => s + Math.abs(r.volume_zscore), 0) / anomalies.length).toFixed(2);
  const biggest = anomalies.reduce((a, b) => Math.abs(b.daily_return) > Math.abs(a.daily_return) ? b : a);

  const metrics = [
    { label: 'Total Anomalies', value: totalAnomalies, sub: 'High confidence' },
    { label: 'Avg Return Z-Score', value: avgReturnZ + 'σ', sub: 'Absolute value' },
    { label: 'Avg Volume Z-Score', value: avgVolZ + 'σ', sub: 'Absolute value' },
    { label: 'Largest Move', value: ((biggest.daily_return > 0 ? '+' : '') + (biggest.daily_return * 100).toFixed(1) + '%'), sub: biggest.ticker },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#0f172a', margin: 0 }}>S&P 500 Anomaly Detection</h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0' }}>Z-Score · Isolation Forest · AI Analysis</p>
        </div>
        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      <div style={{ padding: '24px 32px' }}>

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {metrics.map((m, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px' }}>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</p>
              <p style={{ fontSize: '28px', fontWeight: '600', color: '#0f172a', margin: '0 0 4px' }}>{m.value}</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Main Panel */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
          
          {/* Filters */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['all', 'return', 'volume', 'both'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '6px 14px', fontSize: '12px', fontWeight: '500', borderRadius: '6px', cursor: 'pointer', border: '1px solid',
                  borderColor: filter === f ? '#3b82f6' : '#e2e8f0',
                  background: filter === f ? '#eff6ff' : '#fff',
                  color: filter === f ? '#3b82f6' : '#64748b',
                  textTransform: 'capitalize'
                }}>{f === 'all' ? 'All Signals' : f === 'both' ? 'Return + Volume' : f.charAt(0).toUpperCase() + f.slice(1)}</button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            <input
              placeholder="Search ticker..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '6px 12px', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none', width: '160px', fontFamily: 'inherit' }}
            />
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: '6px 12px', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none', fontFamily: 'inherit', color: '#374151', background: '#fff' }}>
              <option value="return_zscore">Sort: Return Z</option>
              <option value="volume_zscore">Sort: Volume Z</option>
              <option value="daily_return">Sort: Daily Return</option>
            </select>
          </div>

          <AnomalyTable anomalies={anomalies} filter={filter} search={search} sort={sort} />
        </div>

        <p style={{ fontSize: '12px', color: '#cbd5e1', textAlign: 'center', marginTop: '24px' }}>
          Pipeline: yfinance · Detection: Z-Score + Isolation Forest · Summaries: Claude AI
        </p>
      </div>
    </div>
  );
}