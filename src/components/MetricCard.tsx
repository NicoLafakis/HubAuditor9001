import { MetricCard as MetricCardType } from '@/types';

interface MetricCardProps {
  metric: MetricCardType;
}

export default function MetricCard({ metric }: MetricCardProps) {
  const { label, value, percentage, trend, severity } = metric;

  // Color classes based on severity
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

  const borderColor = severity ? severityColors[severity] : 'border-gray-200 bg-white';
  const textColor = severity ? severityTextColors[severity] : 'text-gray-900';

  return (
    <div className={`border-l-4 rounded-lg p-4 shadow-sm ${borderColor}`}>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-600 mb-1">{label}</span>
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
