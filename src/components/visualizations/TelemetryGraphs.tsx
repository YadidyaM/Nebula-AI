import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
  Brush,
  ReferenceArea,
  ReferenceLine
} from 'recharts';
import { Battery, Cpu, AlertTriangle, Info } from 'lucide-react';

interface TelemetryData {
  timestamp: string;
  power: number;
  battery: number;
  storage: number;
}

interface TelemetryGraphsProps {
  data: TelemetryData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-700 mb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-medium" style={{ color: entry.color }}>
                {entry.value.toFixed(2)} {entry.unit}
              </span>
              {entry.name === "Power Consumption" && (
                <span className="text-xs text-gray-500 ml-2">
                  (ISS nominal: 84-120W)
                </span>
              )}
              {entry.name === "Battery Level" && (
                <span className="text-xs text-gray-500 ml-2">
                  (Safe range: 95-100%)
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const TelemetryGraphs: React.FC<TelemetryGraphsProps> = ({ data }) => {
  const [powerZoomRange, setPowerZoomRange] = useState<{ start: number; end: number } | null>(null);
  const [storageZoomRange, setStorageZoomRange] = useState<{ start: number; end: number } | null>(null);

  // ISS-specific thresholds based on real operational parameters
  const powerWarningThreshold = 120; // Above nominal range
  const powerCriticalThreshold = 150; // Significantly above nominal
  const batteryWarningThreshold = 95; // Below optimal charge
  const batteryCriticalThreshold = 90; // Critical level
  const storageWarningThreshold = 90; // 90% of total capacity
  const storageCriticalThreshold = 95; // 95% of total capacity
  const totalStorageCapacity = 128; // 128GB total storage capacity

  // Calculate statistics
  const averagePower = data.reduce((acc, curr) => acc + curr.power, 0) / data.length;
  const averageBattery = data.reduce((acc, curr) => acc + curr.battery, 0) / data.length;
  const averageStorage = data.reduce((acc, curr) => acc + curr.storage, 0) / data.length;

  const maxPower = Math.max(...data.map(d => d.power));
  const minBattery = Math.min(...data.map(d => d.battery));
  const maxStorage = Math.max(...data.map(d => d.storage));

  const getBatteryStatusColor = (level: number) => {
    if (level < batteryCriticalThreshold) return 'text-red-500';
    if (level < batteryWarningThreshold) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getPowerStatusColor = (power: number) => {
    if (power > powerCriticalThreshold) return 'text-red-500';
    if (power > powerWarningThreshold) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStorageStatusColor = (usage: number) => {
    const percentUsed = (usage / totalStorageCapacity) * 100;
    if (percentUsed > storageCriticalThreshold) return 'text-red-500';
    if (percentUsed > storageWarningThreshold) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Power</p>
              <p className="text-2xl font-semibold">{averagePower.toFixed(1)} W</p>
              <p className="text-xs text-gray-500">Nominal range: 84-120W</p>
            </div>
            <Battery className={getPowerStatusColor(maxPower)} />
          </div>
          {maxPower > powerWarningThreshold && (
            <div className="mt-2 flex items-center text-yellow-600 text-sm">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span>{maxPower > powerCriticalThreshold ? 'Critical power consumption' : 'High power consumption'}</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Battery Status</p>
              <p className="text-2xl font-semibold">{averageBattery.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">Optimal range: 95-100%</p>
            </div>
            <Battery className={getBatteryStatusColor(minBattery)} />
          </div>
          {minBattery < batteryWarningThreshold && (
            <div className="mt-2 flex items-center text-red-600 text-sm">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span>{minBattery < batteryCriticalThreshold ? 'Critical battery level' : 'Low battery warning'}</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Storage Usage</p>
              <p className="text-2xl font-semibold">{(averageStorage).toFixed(1)} GB</p>
              <p className="text-xs text-gray-500">Total Capacity: {totalStorageCapacity} GB</p>
            </div>
            <Cpu className={getStorageStatusColor(maxStorage)} />
          </div>
          {maxStorage > (totalStorageCapacity * storageWarningThreshold / 100) && (
            <div className="mt-2 flex items-center text-yellow-600 text-sm">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span>
                {maxStorage > (totalStorageCapacity * storageCriticalThreshold / 100)
                  ? 'Critical storage usage'
                  : 'High storage usage'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Power and Battery Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Power & Battery Telemetry</h3>
          <div className="flex items-center text-sm text-gray-500">
            <Info className="h-4 w-4 mr-1" />
            <span>ISS Power System Status</span>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="batteryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp"
                domain={powerZoomRange ? ['dataMin', 'dataMax'] : undefined}
                height={50}
                angle={-45}
                textAnchor="end"
                tickMargin={20}
              />
              <YAxis 
                yAxisId="power" 
                orientation="left" 
                domain={[0, 200]} 
                label={{ 
                  value: 'Power (W)', 
                  angle: -90, 
                  position: 'insideLeft',
                  offset: 10
                }}
                width={80}
              />
              <YAxis 
                yAxisId="battery" 
                orientation="right" 
                domain={[0, 100]} 
                label={{ 
                  value: 'Battery (%)', 
                  angle: 90, 
                  position: 'insideRight',
                  offset: 10
                }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              
              {/* Warning Thresholds */}
              <ReferenceLine
                y={powerWarningThreshold}
                yAxisId="power"
                stroke="#ff7300"
                strokeDasharray="3 3"
                label={{ 
                  value: 'Warning (120W)', 
                  position: 'insideLeft',
                  fill: '#ff7300',
                  fontSize: 11
                }}
              />
              <ReferenceLine
                y={powerCriticalThreshold}
                yAxisId="power"
                stroke="#ff0000"
                strokeDasharray="3 3"
                label={{ 
                  value: 'Critical (150W)', 
                  position: 'insideLeft',
                  fill: '#ff0000',
                  fontSize: 11
                }}
              />
              <ReferenceLine
                y={batteryWarningThreshold}
                yAxisId="battery"
                stroke="#ff7300"
                strokeDasharray="3 3"
                label={{ 
                  value: 'Warning (95%)', 
                  position: 'insideRight',
                  fill: '#ff7300',
                  fontSize: 11
                }}
              />
              <ReferenceLine
                y={batteryCriticalThreshold}
                yAxisId="battery"
                stroke="#ff0000"
                strokeDasharray="3 3"
                label={{ 
                  value: 'Critical (90%)', 
                  position: 'insideRight',
                  fill: '#ff0000',
                  fontSize: 11
                }}
              />

              <Area 
                yAxisId="power"
                type="monotone" 
                dataKey="power" 
                stroke="#8884d8" 
                fillOpacity={1}
                fill="url(#powerGradient)"
                name="Power Consumption"
                unit=" W"
                isAnimationActive={false}
              />
              <Area 
                yAxisId="battery"
                type="monotone" 
                dataKey="battery" 
                stroke="#82ca9d" 
                fillOpacity={1}
                fill="url(#batteryGradient)"
                name="Battery Level"
                unit="%"
                isAnimationActive={false}
              />
              <Brush 
                dataKey="timestamp" 
                height={30} 
                stroke="#8884d8"
                onChange={(range) => {
                  if (range.startIndex !== undefined && range.endIndex !== undefined) {
                    setPowerZoomRange({
                      start: range.startIndex,
                      end: range.endIndex
                    });
                  }
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Storage Usage Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Storage Usage</h3>
          <div className="flex items-center text-sm text-gray-500">
            <Info className="h-4 w-4 mr-1" />
            <span>ISS Data Storage Status</span>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 20,
                right: 80,
                left: 80,
                bottom: 50
              }}
            >
              <defs>
                <linearGradient id="storageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp"
                domain={storageZoomRange ? ['dataMin', 'dataMax'] : undefined}
                height={50}
                angle={-45}
                textAnchor="end"
                tickMargin={20}
              />
              <YAxis
                domain={[0, totalStorageCapacity]}
                label={{
                  value: 'Storage (GB)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10
                }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              
              {/* Warning Thresholds */}
              <ReferenceLine
                y={totalStorageCapacity * storageWarningThreshold / 100}
                stroke="#ff7300"
                strokeDasharray="3 3"
                label={{
                  value: 'Warning (90%)',
                  position: 'insideLeft',
                  fill: '#ff7300',
                  fontSize: 11
                }}
              />
              <ReferenceLine
                y={totalStorageCapacity * storageCriticalThreshold / 100}
                stroke="#ff0000"
                strokeDasharray="3 3"
                label={{
                  value: 'Critical (95%)',
                  position: 'insideLeft',
                  fill: '#ff0000',
                  fontSize: 11
                }}
              />

              <Area
                type="monotone" 
                dataKey="storage" 
                stroke="#6366f1"
                fillOpacity={1}
                fill="url(#storageGradient)"
                name="Storage Usage"
                unit=" GB"
                isAnimationActive={false}
              />
              <Brush 
                dataKey="timestamp" 
                height={30} 
                stroke="#6366f1"
                onChange={(range) => {
                  if (range.startIndex !== undefined && range.endIndex !== undefined) {
                    setStorageZoomRange({
                      start: range.startIndex,
                      end: range.endIndex
                    });
                  }
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TelemetryGraphs;