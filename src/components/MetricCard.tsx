import { MetricCard as MetricCardType } from '@/types';
import { useState } from 'react';

interface MetricCardProps {
  metric: MetricCardType;
}

export default function MetricCard({ metric }: MetricCardProps) {
  const { label, value, percentage, trend, severity, description } = metric;
  const [showTooltip, setShowTooltip] = useState(false);

  // Color classes based on severity with friendly labels
  const severityColors = {
    good: 'border-success bg-success/10',
    warning: 'border-warning bg-warning/10',
    critical: 'border-error bg-error/10',
  };

  const severityTextColors = {
    good: 'text-success',
    warning: 'text-warning',
    critical: 'text-error',
  };

  const severityLabels = {
    good: 'Looking Good',
    warning: 'Watch This',
    critical: 'Action Needed',
  };

  const borderColor = severity ? severityColors[severity] : 'border-card-border bg-card';
  const textColor = severity ? severityTextColors[severity] : 'text-foreground';

  return (
    <div className={`border-l-4 rounded-lg p-4 shadow-sm ${borderColor} relative`}>
      <div className="flex flex-col">
        <div className="flex items-start justify-between mb-1">
          <span className="text-sm font-medium text-muted-foreground flex-1">{label}</span>
          {description && (
            <div className="relative ml-2">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-muted-foreground hover:text-foreground-light transition-colors"
                aria-label="More information"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {showTooltip && (
                <div className="absolute z-10 w-64 p-3 text-xs text-foreground-light bg-card border border-border rounded-lg shadow-lg -right-2 top-6">
                  {description}
                  <div className="absolute w-2 h-2 bg-card border-t border-l border-border transform rotate-45 -top-1 right-3"></div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-end justify-between">
          <span className={`text-2xl font-bold ${textColor}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {percentage !== undefined && (
            <span className={`text-sm font-semibold ml-2 ${textColor}`}>
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
        {/* Severity Badge */}
        {severity && (
          <div className="mt-3 pt-2 border-t border-border">
            <span className={`text-xs font-medium ${textColor}`}>
              {severity === 'good' && '✓ '}
              {severity === 'warning' && '⚠ '}
              {severity === 'critical' && '⚡ '}
              {severityLabels[severity]}
            </span>
          </div>
        )}
        {trend && (
          <div className="mt-2">
            {trend === 'up' && (
              <span className="text-xs text-error flex items-center">
                ↑ Trending up
              </span>
            )}
            {trend === 'down' && (
              <span className="text-xs text-success flex items-center">
                ↓ Trending down
              </span>
            )}
            {trend === 'neutral' && (
              <span className="text-xs text-muted-foreground flex items-center">
                → Stable
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
