import React from 'react';

const ResultsDisplay = ({ ping, download, upload }) => {
  const Card = ({ title, value, unit, icon }) => (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '1rem',
      margin: '0 0.5rem',
      background: 'rgba(0,0,0,0.2)',
      borderRadius: '12px'
    }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
        {icon} {title}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
        {value > 0 ? value : '--'}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        {unit}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '2rem' }}>
      <Card 
        title="Ping" 
        value={ping} 
        unit="ms" 
        icon={<span style={{color: '#EAB308'}}>⟲</span>} 
      />
      <Card 
        title="Download" 
        value={download} 
        unit="Mbps" 
        icon={<span style={{color: 'var(--accent-cyan)'}}>↓</span>} 
      />
      <Card 
        title="Upload" 
        value={upload} 
        unit="Mbps" 
        icon={<span style={{color: '#8F41E9'}}>↑</span>} 
      />
    </div>
  );
};

export default ResultsDisplay;
