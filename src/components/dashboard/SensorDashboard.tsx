import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Activity, TrendingUp, Settings } from 'lucide-react';
import { useEnvironmentStore } from '../../store/environmentStore';
import { SensorGauge } from './SensorGauge';
import { Card, CardHeader } from '../common';
import type { SensorType } from '../../types';

interface SensorDashboardProps {
  selectedCropOptimalConditions?: {
    temperature: { min: number; max: number; optimal: number };
    humidity: { min: number; max: number; optimal: number };
    light: { min: number; max: number; optimal: number };
    ph: { min: number; max: number; optimal: number };
    ec: { min: number; max: number; optimal: number };
  };
}

export const SensorDashboard: React.FC<SensorDashboardProps> = ({
  selectedCropOptimalConditions
}) => {
  const { environment, history } = useEnvironmentStore();
  const [selectedChart, setSelectedChart] = useState<SensorType>('temperature');

  // Prepare chart data from history
  const chartData = history.slice(-50).map((entry, index) => ({
    time: index,
    temperature: entry.temperature,
    humidity: entry.humidity,
    co2: entry.co2,
    light: entry.lightIntensity,
    soilMoisture: entry.soilMoisture,
    ph: entry.ph,
    ec: entry.ec
  }));

  const chartColors: Record<SensorType, string> = {
    temperature: '#ef4444',
    humidity: '#3b82f6',
    co2: '#8b5cf6',
    light: '#eab308',
    soil: '#22c55e',
    ph: '#f97316',
    ec: '#14b8a6'
  };

  const getChartDataKey = (type: SensorType): string => {
    switch (type) {
      case 'light': return 'light';
      case 'soil': return 'soilMoisture';
      default: return type;
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
      <CardHeader
        title="환경 모니터링"
        subtitle="실시간 센서 데이터"
        icon={<Activity className="w-5 h-5 text-green-400" />}
      />

      {/* Sensor Gauges Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
        <SensorGauge
          type="temperature"
          value={environment.temperature}
          optimalRange={selectedCropOptimalConditions?.temperature}
          unit="°C"
          showTrend
        />
        <SensorGauge
          type="humidity"
          value={environment.humidity}
          optimalRange={selectedCropOptimalConditions?.humidity}
          unit="%"
          showTrend
        />
        <SensorGauge
          type="light"
          value={environment.lightIntensity}
          optimalRange={selectedCropOptimalConditions?.light}
          unit=" PPFD"
          showTrend
        />
        <SensorGauge
          type="co2"
          value={environment.co2}
          unit=" ppm"
          showTrend
        />
        <SensorGauge
          type="soil"
          value={environment.soilMoisture}
          unit="%"
          showTrend
        />
        <SensorGauge
          type="ph"
          value={environment.ph}
          optimalRange={selectedCropOptimalConditions?.ph}
          unit=""
          showTrend
        />
        <SensorGauge
          type="ec"
          value={environment.ec}
          optimalRange={selectedCropOptimalConditions?.ec}
          unit=" mS/cm"
          showTrend
        />
      </div>

      {/* Chart Section */}
      {chartData.length > 0 && (
        <Card className="mt-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-white">추세 그래프</span>
            </div>
            <select
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value as SensorType)}
              className="bg-slate-700 text-white text-sm rounded-lg px-3 py-1.5 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="temperature">온도</option>
              <option value="humidity">습도</option>
              <option value="light">광량</option>
              <option value="co2">CO2</option>
              <option value="soil">토양 수분</option>
              <option value="ph">pH</option>
              <option value="ec">EC</option>
            </select>
          </div>

          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`gradient-${selectedChart}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors[selectedChart]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColors[selectedChart]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="#475569"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#475569"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={getChartDataKey(selectedChart)}
                  stroke={chartColors[selectedChart]}
                  strokeWidth={2}
                  fill={`url(#gradient-${selectedChart})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
};
