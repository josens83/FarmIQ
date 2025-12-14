import React, { memo } from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Leaf,
  FlaskConical,
  Zap
} from 'lucide-react';
import type { SensorType, EnvironmentRange } from '../../types';

interface SensorGaugeProps {
  type: SensorType;
  value: number;
  optimalRange?: EnvironmentRange;
  unit: string;
  showTrend?: boolean;
  previousValue?: number;
  compact?: boolean;
}

const sensorConfig: Record<SensorType, {
  label: string;
  labelKo: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}> = {
  temperature: {
    label: 'Temperature',
    labelKo: '온도',
    icon: <Thermometer className="w-5 h-5" />,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20'
  },
  humidity: {
    label: 'Humidity',
    labelKo: '습도',
    icon: <Droplets className="w-5 h-5" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20'
  },
  co2: {
    label: 'CO2',
    labelKo: 'CO2',
    icon: <Wind className="w-5 h-5" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20'
  },
  light: {
    label: 'Light',
    labelKo: '광량',
    icon: <Sun className="w-5 h-5" />,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20'
  },
  soil: {
    label: 'Soil Moisture',
    labelKo: '토양 수분',
    icon: <Leaf className="w-5 h-5" />,
    color: 'text-green-400',
    bgColor: 'bg-green-500/20'
  },
  ph: {
    label: 'pH Level',
    labelKo: 'pH',
    icon: <FlaskConical className="w-5 h-5" />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20'
  },
  ec: {
    label: 'EC Level',
    labelKo: 'EC',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/20'
  }
};

export const SensorGauge = memo<SensorGaugeProps>(function SensorGauge({
  type,
  value,
  optimalRange,
  unit,
  showTrend = false,
  previousValue,
  compact = false
}) {
  const config = sensorConfig[type];

  // Determine status based on optimal range
  let status: 'optimal' | 'warning' | 'danger' = 'optimal';
  if (optimalRange) {
    if (value < optimalRange.min || value > optimalRange.max) {
      const distance = value < optimalRange.min
        ? optimalRange.min - value
        : value - optimalRange.max;
      const rangeSize = optimalRange.max - optimalRange.min;
      status = distance > rangeSize * 0.3 ? 'danger' : 'warning';
    }
  }

  const statusColors = {
    optimal: 'ring-green-500/50 bg-green-500/10',
    warning: 'ring-yellow-500/50 bg-yellow-500/10',
    danger: 'ring-red-500/50 bg-red-500/10'
  };

  const statusPulse = {
    optimal: '',
    warning: 'animate-pulse',
    danger: 'animate-pulse'
  };

  // Calculate trend
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (showTrend && previousValue !== undefined) {
    const diff = value - previousValue;
    if (diff > 0.1) trend = 'up';
    else if (diff < -0.1) trend = 'down';
  }

  const statusLabels = {
    optimal: '정상',
    warning: '주의',
    danger: '위험'
  };

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 p-2 rounded-lg ${config.bgColor} ${statusColors[status]} ring-1`}
        role="status"
        aria-label={`${config.labelKo}: ${value.toFixed(1)}${unit}, 상태: ${statusLabels[status]}`}
      >
        <span className={config.color} aria-hidden="true">{config.icon}</span>
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">{config.labelKo}</span>
          <span className="text-sm font-semibold text-white">
            {value.toFixed(1)}{unit}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-xl ${statusColors[status]} ring-2 ${statusPulse[status]}`}
      role="status"
      aria-label={`${config.labelKo}: ${value.toFixed(1)}${unit}, 상태: ${statusLabels[status]}`}
      aria-live={status !== 'optimal' ? 'polite' : 'off'}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${config.bgColor}`}>
          <span className={config.color} aria-hidden="true">{config.icon}</span>
        </div>
        {showTrend && trend !== 'stable' && (
          <span
            className={trend === 'up' ? 'text-red-400' : 'text-blue-400'}
            aria-label={trend === 'up' ? '상승 중' : '하락 중'}
          >
            {trend === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>

      <div className="mb-2">
        <span className="text-2xl font-bold text-white">
          {value.toFixed(1)}
        </span>
        <span className="text-sm text-slate-400 ml-1">{unit}</span>
      </div>

      <div className="text-sm text-slate-400">{config.labelKo}</div>

      {optimalRange && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              최적: {optimalRange.min}-{optimalRange.max}{unit}
            </span>
            <span className={`font-medium ${
              status === 'optimal' ? 'text-green-400' :
              status === 'warning' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {statusLabels[status]}
            </span>
          </div>

          {/* Visual range indicator */}
          <div
            className="mt-2 relative h-2 bg-slate-700 rounded-full overflow-hidden"
            role="meter"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={optimalRange.max * 1.5}
            aria-label={`${config.labelKo} 게이지`}
          >
            {/* Optimal range highlight */}
            <div
              className="absolute h-full bg-green-500/30"
              style={{
                left: `${(optimalRange.min / (optimalRange.max * 1.5)) * 100}%`,
                width: `${((optimalRange.max - optimalRange.min) / (optimalRange.max * 1.5)) * 100}%`
              }}
              aria-hidden="true"
            />
            {/* Current value indicator */}
            <div
              className={`absolute w-2 h-2 rounded-full ${
                status === 'optimal' ? 'bg-green-500' :
                status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{
                left: `${Math.min(100, (value / (optimalRange.max * 1.5)) * 100)}%`,
                transform: 'translateX(-50%)'
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      )}
    </div>
  );
});
