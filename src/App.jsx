import React from 'react';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <>
      <main style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center' }}>
        <h1 className="glow-text" style={{ 
          margin: '2rem 0 4rem 0', 
          fontSize: '2.5rem', 
          letterSpacing: '2px',
          background: '-webkit-linear-gradient(45deg, #30D2A6, #2E81ED)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          SPEEDTEST
        </h1>
        
        <Dashboard />

      </main>
      
      <footer style={{ marginTop: 'auto', padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        Simulated Environment — Not for actual diagnostics
      </footer>
    </>
  );
}

export default App;
