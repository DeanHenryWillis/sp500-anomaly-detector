import React, { useState } from 'react';

function getSignal(r) {
  const rAnom = Math.abs(r.return_zscore) > 3;
  const vAnom = Math.abs(r.volume_zscore) > 3;
  if (rAnom && vAnom) return 'both';
  if (rAnom) return 'return';
  return 'volume';
}

const SignalBadge = ({ type }) => {
  const styles = {
    both:   { background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' },
    return: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
    volume: { background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' },
  };
  const labels = { both: 'Return + Volume', return: 'Return', volume: 'Volume' };
  return (
    <span style={{ ...styles[type], padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '500' }}>
      {labels[type]}
    </span>
  );
};

export default function AnomalyTable({ anomalies, filter, search, sort }) {
  const [expanded, setExpanded] = useState(null);

  let data = anomalies.slice();
  if (search) data = data.filter(r => r.ticker.toUpperCase().includes(search.toUpperCase()));
  if (filter !== 'all') data = data.filter(r => getSignal(r) === filter);
  data.sort((a, b) => Math.abs(b[sort]) - Math.abs(a[sort]));

  const th = { padding: '10px 16px', fontSize: '11px', fontWeight: '600', color: '#64748b', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' };
  const td = { padding: '14px 16px', fontSize: '13px', color: '#374151', borderBottom: '1px solid #f8fafc', whiteSpace: 'nowrap', verticalAlign: 'top' };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            <th style={th}>Ticker</th>
            <th style={th}>Date</th>
            <th style={th}>Close</th>
            <th style={th}>Daily Return</th>
            <th style={th}>Return Z</th>
            <th style={th}>Volume Z</th>
            <th style={th}>Signal</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => {
            const isExp = expanded === i;
            const retColor = r.daily_return > 0 ? '#16a34a' : '#dc2626';
            const retSign = r.daily_return > 0 ? '+' : '';
            return (
              <React.Fragment key={i}>
                <tr onClick={() => setExpanded(isExp ? null : i)} style={{ cursor: 'pointer', background: isExp ? '#f8fafc' : '#fff', transition: 'background 0.1s' }}
                  onMouseEnter={e => { if (!isExp) e.currentTarget.style.background = '#f8fafc' }}
                  onMouseLeave={e => { if (!isExp) e.currentTarget.style.background = '#fff' }}>
                  <td style={{ ...td, fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>{r.ticker}</td>
                  <td style={{ ...td, color: '#64748b' }}>{r.date}</td>
                  <td style={td}>${parseFloat(r.close).toFixed(2)}</td>
                  <td style={{ ...td, color: retColor, fontWeight: '500' }}>{retSign}{(r.daily_return * 100).toFixed(1)}%</td>
                  <td style={{ ...td, fontFamily: 'monospace' }}>{r.return_zscore > 0 ? '+' : ''}{r.return_zscore.toFixed(2)}σ</td>
                  <td style={{ ...td, fontFamily: 'monospace' }}>{r.volume_zscore.toFixed(2)}σ</td>
                  <td style={td}><SignalBadge type={getSignal(r)} /></td>
                </tr>
                {isExp && (
                  <tr style={{ background: '#f8fafc' }}>
                    <td colSpan={7} style={{ padding: '0 16px 16px 48px', borderBottom: '1px solid #e2e8f0' }}>
                      <p style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>AI Analysis · {r.ticker} · {r.date}</p>
                      <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.7', margin: 0, maxWidth: '720px' }}>{r.summary}</p>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#94a3b8' }}>
        Showing {data.length} of {anomalies.length} anomalies
      </div>
    </div>
  );
}
