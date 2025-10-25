import { MetricGroup } from '@/types';
import MetricCard from './MetricCard';

interface MetricsSidebarProps {
  metricGroups: MetricGroup[];
}

export default function MetricsSidebar({ metricGroups }: MetricsSidebarProps) {
  return (
    <div className="w-full lg:w-96 bg-sidebar border-r border-border p-6 overflow-y-auto">
      <h2 className="text-xl font-bold text-foreground mb-6">Your HubSpot Health</h2>

      <div className="space-y-6">
        {metricGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground-light uppercase tracking-wider">
              {group.title}
            </h3>
            <div className="space-y-3">
              {group.metrics.map((metric, metricIndex) => (
                <MetricCard key={metricIndex} metric={metric} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
