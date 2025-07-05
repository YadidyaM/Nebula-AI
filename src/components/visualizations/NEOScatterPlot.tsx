import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Legend } from 'recharts';

interface NEOScatterPlotProps {
  data: Array<{
    name: string;
    size: number;
    distance: number;
    velocity: number;
    isHazardous: boolean;
  }>;
}

const formatDistance = (value: number) => {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
};

const NEOScatterPlot: React.FC<NEOScatterPlotProps> = ({ data }) => {
  const safeObjects = data.filter(obj => !obj.isHazardous);
  const hazardousObjects = data.filter(obj => obj.isHazardous);

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 20,
            right: 30,
            bottom: 20,
            left: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis 
            type="number" 
            dataKey="distance" 
            name="Distance" 
            unit=" km"
            stroke="#4b5563"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickFormatter={formatDistance}
            domain={[0, 'dataMax']}
            label={{ 
              value: 'Miss Distance (km)', 
              position: 'bottom', 
              fill: '#9ca3af',
              offset: 0
            }}
          />
          <YAxis 
            type="number" 
            dataKey="velocity" 
            name="Velocity" 
            unit=" km/h"
            stroke="#4b5563"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            domain={[0, 28]}
            tickCount={5}
            label={{ 
              value: 'Velocity (km/h)', 
              angle: -90, 
              position: 'left', 
              fill: '#9ca3af',
              offset: 0
            }}
          />
          <ZAxis 
            type="number" 
            dataKey="size" 
            range={[40, 400]} 
            name="Size" 
            unit="m"
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '0.5rem',
              backdropFilter: 'blur(4px)',
            }}
            labelStyle={{ color: '#e5e7eb' }}
            formatter={(value: any, name: string) => {
              if (name === 'Distance') return [formatDistance(value) + ' km', name];
              if (name === 'Velocity') return [value + ' km/h', name];
              if (name === 'Size') return [value + ' m', name];
              return [value, name];
            }}
          />
          <Legend 
            align="right"
            verticalAlign="top"
            wrapperStyle={{
              paddingBottom: '10px',
              fontSize: '12px',
            }}
          />
          <Scatter
            name="Safe Objects"
            data={safeObjects}
            fill="#10b981"
            fillOpacity={0.6}
          />
          <Scatter
            name="Hazardous Objects"
            data={hazardousObjects}
            fill="#ef4444"
            fillOpacity={0.6}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NEOScatterPlot; 