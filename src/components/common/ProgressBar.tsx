import React, { memo } from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const ProgressBar = memo<ProgressBarProps>(function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = 'green',
  showLabel = false,
  label,
  className = ''
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const colors = {
    green: 'bg-gradient-to-r from-green-500 to-emerald-400',
    blue: 'bg-gradient-to-r from-blue-500 to-cyan-400',
    yellow: 'bg-gradient-to-r from-yellow-500 to-amber-400',
    red: 'bg-gradient-to-r from-red-500 to-rose-400',
    purple: 'bg-gradient-to-r from-purple-500 to-violet-400'
  };

  const glowColors = {
    green: 'shadow-green-500/50',
    blue: 'shadow-blue-500/50',
    yellow: 'shadow-yellow-500/50',
    red: 'shadow-red-500/50',
    purple: 'shadow-purple-500/50'
  };

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-slate-400" id={label ? `progress-label-${label.replace(/\s/g, '-')}` : undefined}>
            {label}
          </span>
          {showLabel && (
            <span className="text-sm font-medium text-white" aria-hidden="true">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-slate-700 rounded-full overflow-hidden ${sizes[size]}`}
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || '진행률'}
      >
        <div
          className={`${sizes[size]} ${colors[color]} rounded-full transition-all duration-500 ease-out shadow-lg ${glowColors[color]}`}
          style={{ width: `${percentage}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
});
