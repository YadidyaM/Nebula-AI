import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface SolarActivityChartProps {
  data: {
    time: string;
    intensity: number;
    classType: string;
  }[];
}

const SolarActivityChart: React.FC<SolarActivityChartProps> = ({ data }) => {
  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#92400e" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#1f2937" 
            vertical={false}
          />
          <XAxis 
            dataKey="time" 
            stroke="#4b5563"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickFormatter={(time) => format(new Date(time), 'HH:mm')}
            axisLine={{ stroke: '#1f2937' }}
          />
          <YAxis 
            stroke="#4b5563"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            domain={[0, 8]}
            tickCount={5}
            axisLine={{ stroke: '#1f2937' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '0.5rem',
              backdropFilter: 'blur(4px)',
            }}
            labelStyle={{ color: '#e5e7eb' }}
            itemStyle={{ color: '#fbbf24' }}
            labelFormatter={(time) => format(new Date(time), 'yyyy-MM-dd HH:mm')}
          />
          <Area
            type="monotone"
            dataKey="intensity"
            stroke="#fbbf24"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#solarGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SolarActivityChart; 