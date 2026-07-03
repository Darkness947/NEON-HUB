import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const GenreChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-muted text-center py-4">
        Not enough data to analyze genres.
      </div>
    );
  }

  // Neon colors
  const colors = [
    '#7B2FBE', // Neon Purple
    '#00B4D8', // Electric Blue
    '#F4A261', // Amber
    '#2D9E5F', // Neon Green
    '#E53E3E'  // Crimson
  ];

  return (
    <div style={{ width: '100%', height: 300 }} className="fade-in">
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2c2c3e" horizontal={false} />
          <XAxis type="number" stroke="var(--color-text-secondary)" tick={{ fill: 'var(--color-text-secondary)' }} />
          <YAxis 
            dataKey="name" 
            type="category" 
            stroke="var(--color-text-secondary)" 
            tick={{ fill: 'var(--color-text-primary)' }}
            width={100}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
            contentStyle={{ backgroundColor: 'var(--color-bg-elevated)', border: '1px solid #2c2c3e', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GenreChart;
