import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell
} from 'recharts';
import { useTranslation } from 'react-i18next';

const InsightsChart = ({ data }) => {
  const { t } = useTranslation();
  if (!data || data.length === 0 || data.every(d => d.count === 0)) {
    return (
      <div className="text-muted text-center py-4">
        {t('profile.noRatingsData')}
      </div>
    );
  }

  // Find max value to give some headroom for the labels above bars
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div style={{ width: '100%', height: 350, display: 'flex', flexDirection: 'column' }} className="fade-in mt-2">
      <div className="d-flex flex-column mb-4">
        <h4 className="mb-1 text-light fw-bold" style={{ borderLeft: '4px solid var(--accent-neon-yellow, #F4A261)', paddingLeft: '10px' }}>{t('profile.insights')}</h4>
        <span className="text-light fs-5">{t('profile.ratingBreakdown')}</span>
        <span className="text-muted small">{t('profile.ratingDesc')}</span>
      </div>
      <div style={{ flex: 1, minHeight: 0 }} className="recharts-no-outline">
        <ResponsiveContainer width="100%" height="100%" style={{ outline: 'none' }}>
        <BarChart
          data={data}
          style={{ outline: 'none' }}
          margin={{
            top: 25, // space for labels
            right: 5,
            left: 5,
            bottom: 5,
          }}
        >
          <XAxis 
            dataKey="rating" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#ffffff', fontSize: 14 }} 
            dy={10} 
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
            contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid #2c2c3e', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value) => [value, t('library.all')]}
            labelFormatter={(label) => `${label} ${t('profile.stars')}`}
          />
          <Bar dataKey="count" fill="#4A90E2" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="count" position="top" fill="#ffffff" fontSize={14} formatter={(val) => val > 0 ? val : ''} />
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#58a6ff" style={{ outline: 'none' }} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InsightsChart;
