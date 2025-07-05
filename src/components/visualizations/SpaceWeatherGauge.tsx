import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface SpaceWeatherGaugeProps {
  kpIndex: number;
  impact: 'Minimal' | 'Minor' | 'Moderate' | 'Strong' | 'Severe' | 'Extreme';
}

const SpaceWeatherGauge: React.FC<SpaceWeatherGaugeProps> = ({ kpIndex, impact }) => {
  const maxKp = 9;
  const data = [
    { name: 'value', value: kpIndex },
    { name: 'empty', value: maxKp - kpIndex }
  ];

  // Create tick marks for the gauge
  const ticks = Array.from({ length: 10 }, (_, i) => i);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Minimal': return '#10b981';
      case 'Minor': return '#fbbf24';
      case 'Moderate': return '#f59e0b';
      case 'Strong': return '#ef4444';
      case 'Severe': return '#dc2626';
      case 'Extreme': return '#7f1d1d';
      default: return '#10b981';
    }
  };

  return (
    <div className="relative w-full h-[200px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {/* Tick marks */}
          {ticks.map((tick) => {
            const angle = -180 + (tick * 20); // 180 degrees spread over 9 ticks
            const rad = angle * (Math.PI / 180);
            const x1 = Math.cos(rad) * 85;
            const y1 = Math.sin(rad) * 85;
            const x2 = Math.cos(rad) * 95;
            const y2 = Math.sin(rad) * 95;
            return (
              <line
                key={tick}
                x1={100 + x1}
                y1={100 + y1}
                x2={100 + x2}
                y2={100 + y2}
                stroke="#4b5563"
                strokeWidth={2}
              />
            );
          })}
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={75}
            outerRadius={90}
            cornerRadius={5}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell 
              fill={getImpactColor(impact)} 
              filter="url(#glow)"
            />
            <Cell fill="#1f2937" />
          </Pie>
          <defs>
            <filter id="glow" height="200%" width="200%" x="-50%" y="-50%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600">
          {kpIndex}
        </div>
        <div className="text-gray-400 mt-2 text-lg">Kp Index</div>
        <div 
          className="text-sm mt-1 font-medium" 
          style={{ color: getImpactColor(impact) }}
        >
          {impact} Impact
        </div>
      </div>
    </div>
  );
};

export default SpaceWeatherGauge; 