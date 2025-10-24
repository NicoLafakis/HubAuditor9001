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
    good: 'border-green-500 bg-green-50',
    warning: 'border-yellow-500 bg-yellow-50',
    critical: 'border-red-500 bg-red-50',
  };

  const severityTextColors = {
    good: 'text-green-800',
    warning: 'text-yellow-800',
    critical: 'text-red-800',
  };

  const severityLabels = {
    good: 'Looking Good',
    warning: 'Watch This',
    critical: 'Action Needed',
  };

  const borderColor = severity ? severityColors[severity] : 'border-gray-200 bg-white';
  const textColor = severity ? severityTextColors[severity] : 'text-gray-900';

  return (
    <div className={`border-l-4 rounded-lg p-4 shadow-sm ${borderColor} relative`}>
      <div className="flex flex-col">
        <div className="flex items-start justify-between mb-1">
          <span className="text-sm font-medium text-gray-600 flex-1">{label}</span>
          {description && (
            <div className="relative ml-2">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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
                <div className="absolute z-10 w-64 p-3 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg -right-2 top-6">
                  {description}
                  <div className="absolute w-2 h-2 bg-white border-t border-l border-gray-200 transform rotate-45 -top-1 right-3"></div>
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
          <div className="mt-3 pt-2 border-t border-gray-200">
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
              <span className="text-xs text-red-600 flex items-center">
                ↑ Trending up
              </span>
            )}
            {trend === 'down' && (
              <span className="text-xs text-green-600 flex items-center">
                ↓ Trending down
              </span>
            )}
            {trend === 'neutral' && (
              <span className="text-xs text-gray-600 flex items-center">
                → Stable
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
