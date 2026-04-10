import React from 'react';

const Gauge = ({ value, state }) => {
  // SVG settings
  const size = 250;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // We'll make it a half-circle

  // Calculate filled portion
  // Max speed for display purposes accommodates up to 1 Gbps (1000 Mbps)
  const maxSpeed = 1000;
  const percent = Math.min(value / maxSpeed, 1);
  const strokeDashoffset = circumference - percent * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size / 2 + strokeWidth, margin: '0 auto' }}>
      <svg
        width={size}
        height={size / 2 + strokeWidth}
        style={{
          transform: 'rotate(-180deg)',
        }}
      >
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="transparent"
          stroke={state === 'UPLOAD' ? '#8F41E9' : 'var(--accent-cyan)'} /* Different color for upload */
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.1s ease-out, stroke 0.3s ease-in-out' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translate(-50%, -100%)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>
          {parseFloat(value).toFixed(1)}
        </div>
        <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
          Mbps
        </div>
      </div>
    </div>
  );
};

export default Gauge;
