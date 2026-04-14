import React, { useState, useRef, useEffect } from 'react';
import Gauge from './Gauge';
import ResultsDisplay from './ResultsDisplay';
import SpeedTest from '@cloudflare/speedtest';
import NoSleep from 'nosleep.js';

const Dashboard = () => {
  const [testState, setTestState] = useState('IDLE'); // IDLE, RUNNING, DONE
  const [metrics, setMetrics] = useState({
    ping: 0,
    download: 0,
    upload: 0,
    gaugeValue: 0,
    phase: 'IDLE' // PING, DOWNLOAD, UPLOAD, DONE
  });
  
  const engineRef = useRef(null);
  const noSleepRef = useRef(new NoSleep());

  const requestWakeLock = () => {
    try {
      if (!noSleepRef.current.isEnabled) {
        noSleepRef.current.enable();
      }
    } catch (err) {
      console.error(`NoSleep enable error: ${err.message}`);
    }
  };

  const releaseWakeLock = () => {
    try {
      if (noSleepRef.current.isEnabled) {
        noSleepRef.current.disable();
      }
    } catch (err) {
      console.error(`NoSleep disable error: ${err.message}`);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      // Re-enable if the user returns to the tab while test is running
      if (document.visibilityState === 'visible' && testState === 'RUNNING') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [testState]);

  useEffect(() => {
    return () => {
      releaseWakeLock();
    };
  }, []);


  const startTest = () => {
    setTestState('RUNNING');
    setMetrics({ ping: 0, download: 0, upload: 0, gaugeValue: 0, phase: 'PING' });
    requestWakeLock();
    
    // Instantiate actual Cloudflare engine with a up to 10 hours (36000000ms) duration threshold
    const engine = new SpeedTest({ 
      autoStart: true,
      bandwidthFinishRequestDuration: 36000000, // 10 hours completely disables early abort
      measurements: [
        { type: 'latency', numPackets: 20 },
        { type: 'download', bytes: 1e5, count: 5 },
        { type: 'download', bytes: 1e6, count: 5 },
        { type: 'download', bytes: 1e7, count: 10 },
        { type: 'download', bytes: 2.5e7, count: 10 },
        { type: 'download', bytes: 1e8, count: 100000 }, 
        { type: 'upload', bytes: 1e5, count: 5 },
        { type: 'upload', bytes: 1e6, count: 5 },
        { type: 'upload', bytes: 1e7, count: 10 },
        { type: 'upload', bytes: 2.5e7, count: 10 },
        { type: 'upload', bytes: 5e7, count: 100000 } 
      ]
    });

    engineRef.current = engine;

    let lastRenderTime = 0;

    engine.onResultsChange = ({ type }) => {
      // FIX smoothness: Reinstated the UI throttle to prevent browser lag.
      // Capping updates to ~10 times per second so it remains silky smooth.
      const now = Date.now();
      if (now - lastRenderTime < 100) return; 
      lastRenderTime = now;

      const summary = engine.results.getSummary();
      
      let phase = 'PING';
      let gaugeVal = 0;

      if (type === 'download' || type === 'downloadLoadedLatency') {
        phase = 'DOWNLOAD';
      } else if (type === 'upload' || type === 'uploadLoadedLatency') {
        phase = 'UPLOAD';
      }

      const downMbps = summary.download ? (summary.download / 1e6).toFixed(2) : 0;
      const upMbps = summary.upload ? (summary.upload / 1e6).toFixed(2) : 0;
      const pingMs = summary.latency ? Math.round(summary.latency) : 0;

      if (phase === 'DOWNLOAD') {
        gaugeVal = downMbps;
      } else if (phase === 'UPLOAD') {
        gaugeVal = upMbps;
      }

      setMetrics({
        ping: pingMs,
        download: downMbps,
        upload: upMbps,
        gaugeValue: gaugeVal,
        phase
      });
    };

    engine.onFinish = (results) => {
      const summary = results.getSummary();
      const downMbps = summary.download ? (summary.download / 1e6).toFixed(2) : 0;
      const upMbps = summary.upload ? (summary.upload / 1e6).toFixed(2) : 0;
      const pingMs = summary.latency ? Math.round(summary.latency) : 0;

      setMetrics({
        ping: pingMs,
        download: downMbps,
        upload: upMbps,
        gaugeValue: 0,
        phase: 'DONE'
      });
      setTestState('DONE');
      releaseWakeLock();
    };
    
    if (typeof engine.play === 'function') {
      engine.play();
    }
  };

  const stopTest = () => {
    if (engineRef.current) {
      if (typeof engineRef.current.pause === 'function') {
        engineRef.current.pause(); 
      }
    }
    
    // Finalize the UI
    setMetrics(prev => ({
      ...prev,
      gaugeValue: 0,
      phase: 'DONE'
    }));
    setTestState('DONE');
    releaseWakeLock();
  };

  const getStatusText = () => {
    switch (metrics.phase) {
      case 'PING': return 'Checking Latency...';
      case 'DOWNLOAD': return 'Testing Download...';
      case 'UPLOAD': return 'Testing Upload...';
      case 'DONE': return 'Test Complete';
      default: return 'Ready To Test';
    }
  };

  return (
    <div className="glass-panel" style={{
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '400px',
      justifyContent: 'center',
      position: 'relative'
    }}>
      
      {testState === 'IDLE' ? (
        <button 
          onClick={startTest}
          style={{
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: 'transparent',
            border: '2px solid var(--accent-cyan)',
            color: 'var(--text-main)',
            fontSize: '2rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            animation: 'pulse 2s infinite',
            transition: 'transform 0.2s',
            outline: 'none',
          }}
          onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.target.style.transform = 'scale(1)'}
        >
          GO
        </button>
      ) : (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ marginBottom: '2rem', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
            {getStatusText()}
          </div>
          
          <div style={{ opacity: metrics.phase === 'DONE' ? 0.3 : 1, transition: 'opacity 0.5s' }}>
             <Gauge value={metrics.gaugeValue} state={metrics.phase} />
          </div>

          <ResultsDisplay 
            ping={metrics.ping} 
            download={metrics.download} 
            upload={metrics.upload} 
          />

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            {testState === 'RUNNING' && (
              <button 
                  onClick={stopTest}
                  style={{
                    padding: '10px 30px',
                    borderRadius: '20px',
                    background: 'rgba(239, 68, 68, 0.2)', // Red tint for stop
                    border: '1px solid #EF4444',
                    color: '#EF4444',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={e => { e.target.style.background = '#EF4444'; e.target.style.color = '#fff'; }}
                  onMouseOut={e => { e.target.style.background = 'rgba(239, 68, 68, 0.2)'; e.target.style.color = '#EF4444'; }}
              >
                ■ Stop
              </button>
            )}

            {testState === 'DONE' && (
              <button 
                  onClick={() => setTestState('IDLE')}
                  style={{
                    padding: '10px 30px',
                    borderRadius: '20px',
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                  }}
              >
                Test Again
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default Dashboard;
