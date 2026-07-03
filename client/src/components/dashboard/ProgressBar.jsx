import React from 'react';

const ProgressBar = ({ percentage, color, label, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="d-flex flex-column align-items-center fade-in">
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          stroke="var(--color-bg-elevated)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
        {/* Percentage text */}
        <text
          x="50%"
          y="50%"
          dy=".3em"
          textAnchor="middle"
          fill="var(--color-text-primary)"
          style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 600 }}
        >
          {Math.round(percentage)}%
        </text>
      </svg>
      {label && <div className="mt-2 text-muted" style={{ fontSize: '0.85rem' }}>{label}</div>}
    </div>
  );
};

export default ProgressBar;
