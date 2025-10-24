import { HubSpotDeal, PipelineHealthMetrics, MetricGroup } from '@/types';

/**
 * Calculate Deal Pipeline Health metrics
 */
export function calculatePipelineHealthMetrics(
  deals: HubSpotDeal[]
): PipelineHealthMetrics {
  const totalDeals = deals.length;

  // Deals by stage
  const dealsByStage: Record<string, number> = {};
  deals.forEach(deal => {
    const stage = deal.properties.dealstage || 'Unknown';
    dealsByStage[stage] = (dealsByStage[stage] || 0) + 1;
  });

  // Average deal age by stage (in days)
  const avgDealAgeByStage: Record<string, number> = {};
  const dealAgesByStage: Record<string, number[]> = {};

  deals.forEach(deal => {
    const stage = deal.properties.dealstage || 'Unknown';
    const createDate = deal.properties.createdate;

    if (createDate) {
      const ageInDays = Math.floor(
        (Date.now() - new Date(createDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (!dealAgesByStage[stage]) {
        dealAgesByStage[stage] = [];
      }
      dealAgesByStage[stage].push(ageInDays);
    }
  });

  // Calculate averages
  for (const [stage, ages] of Object.entries(dealAgesByStage)) {
    avgDealAgeByStage[stage] = Math.round(
      ages.reduce((sum, age) => sum + age, 0) / ages.length
    );
  }

  // Stuck deals (not modified in 30+ days)
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const stuckDeals = deals.filter(deal => {
    const lastModified = deal.properties.hs_lastmodifieddate;
    if (!lastModified) return true;
    return new Date(lastModified).getTime() < thirtyDaysAgo;
  }).length;
  const stuckDealsPct = totalDeals > 0 ? (stuckDeals / totalDeals) * 100 : 0;

  // Missing close date
  const missingCloseDate = deals.filter(d => !d.properties.closedate).length;
  const missingCloseDatePct = totalDeals > 0 ? (missingCloseDate / totalDeals) * 100 : 0;

  // Missing amount
  const missingAmount = deals.filter(d => !d.properties.amount).length;
  const missingAmountPct = totalDeals > 0 ? (missingAmount / totalDeals) * 100 : 0;

  // Total pipeline value
  const totalPipelineValue = deals.reduce((sum, deal) => {
    const amount = parseFloat(deal.properties.amount || '0');
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  return {
    totalDeals,
    dealsByStage,
    avgDealAgeByStage,
    stuckDeals,
    stuckDealsPct,
    missingCloseDate,
    missingCloseDatePct,
    missingAmount,
    missingAmountPct,
    totalPipelineValue,
  };
}

/**
 * Convert metrics to MetricGroup format for UI display
 */
export function formatPipelineHealthMetrics(
  metrics: PipelineHealthMetrics
): MetricGroup[] {
  return [
    {
      title: 'Overview',
      metrics: [
        {
          label: 'Total Deals',
          value: metrics.totalDeals,
          severity: 'good',
          description: 'The total number of deals currently in your sales pipeline.',
        },
        {
          label: 'Total Pipeline Value',
          value: `$${(metrics.totalPipelineValue / 1000).toFixed(1)}K`,
          severity: 'good',
          description: 'The combined dollar value of all deals in your pipeline. This shows your potential revenue if all deals close.',
        },
      ],
    },
    {
      title: 'Pipeline Issues',
      metrics: [
        {
          label: 'Stuck Deals (30+ days)',
          value: metrics.stuckDeals,
          percentage: metrics.stuckDealsPct,
          severity: metrics.stuckDealsPct > 30 ? 'critical' : metrics.stuckDealsPct > 15 ? 'warning' : 'good',
          description: 'Deals that haven\'t been updated in over a month. These might be stalled or abandoned and need attention from your sales team.',
        },
        {
          label: 'Missing Close Date',
          value: metrics.missingCloseDate,
          percentage: metrics.missingCloseDatePct,
          severity: metrics.missingCloseDatePct > 20 ? 'critical' : metrics.missingCloseDatePct > 10 ? 'warning' : 'good',
          description: 'Deals without an expected close date. This makes it hard to forecast revenue and plan your sales pipeline.',
        },
        {
          label: 'Missing Amount',
          value: metrics.missingAmount,
          percentage: metrics.missingAmountPct,
          severity: metrics.missingAmountPct > 25 ? 'critical' : metrics.missingAmountPct > 10 ? 'warning' : 'good',
          description: 'Deals without a dollar value. You can\'t accurately forecast revenue without knowing how much each deal is worth.',
        },
      ],
    },
    {
      title: 'Deals by Stage',
      metrics: Object.entries(metrics.dealsByStage)
        .sort((a, b) => b[1] - a[1])
        .map(([stage, count]) => ({
          label: stage,
          value: count,
          percentage: (count / metrics.totalDeals) * 100,
        })),
    },
    {
      title: 'Average Deal Age by Stage',
      metrics: Object.entries(metrics.avgDealAgeByStage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([stage, avgAge]) => ({
          label: stage,
          value: `${avgAge} days`,
          severity: avgAge > 90 ? 'warning' : 'good',
        })),
    },
  ];
}
