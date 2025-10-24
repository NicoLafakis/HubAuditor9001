import { HubSpotContact, LeadScoringMetrics, MetricGroup } from '@/types';

/**
 * Calculate Lead Scoring and Segmentation metrics
 */
export function calculateLeadScoringMetrics(
  contacts: HubSpotContact[]
): LeadScoringMetrics {
  const totalContacts = contacts.length;

  // Contacts by lifecycle stage
  const contactsByLifecycle: Record<string, number> = {};
  contacts.forEach(contact => {
    const stage = contact.properties.lifecyclestage || 'Unknown';
    contactsByLifecycle[stage] = (contactsByLifecycle[stage] || 0) + 1;
  });

  // Lead score distribution (if available)
  const leadScoreDistribution: Record<string, number> = {
    'No Score': 0,
    'Low (1-30)': 0,
    'Medium (31-70)': 0,
    'High (71-100)': 0,
  };

  contacts.forEach(contact => {
    const score = contact.properties.hs_lead_score || contact.properties.hubspotscore;
    if (!score) {
      leadScoreDistribution['No Score']++;
    } else {
      const scoreNum = parseInt(score);
      if (scoreNum <= 30) leadScoreDistribution['Low (1-30)']++;
      else if (scoreNum <= 70) leadScoreDistribution['Medium (31-70)']++;
      else leadScoreDistribution['High (71-100)']++;
    }
  });

  // Average time to conversion (from lead to customer)
  const avgTimeToConversion: Record<string, number> = {};
  const conversionTimes: number[] = [];
  contacts.forEach(contact => {
    if (contact.properties.lifecyclestage === 'customer' && contact.properties.createdate) {
      const created = new Date(contact.properties.createdate).getTime();
      const updated = new Date(contact.updatedAt).getTime();
      const daysDiff = Math.floor((updated - created) / (1000 * 60 * 60 * 24));
      conversionTimes.push(daysDiff);
    }
  });

  if (conversionTimes.length > 0) {
    const avgDays = conversionTimes.reduce((a, b) => a + b, 0) / conversionTimes.length;
    avgTimeToConversion['Average Days'] = Math.round(avgDays);
  } else {
    avgTimeToConversion['Average Days'] = 0;
  }

  // Segment overlap (contacts with multiple lifecycle stages - unusual but can happen)
  const segmentOverlap = 0; // This would require more complex analysis of list memberships

  // Engagement rate (contacts with recent activity)
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentlyEngaged = contacts.filter(c => {
    const lastModified = c.properties.lastmodifieddate;
    if (!lastModified) return false;
    return new Date(lastModified).getTime() > thirtyDaysAgo;
  }).length;
  const engagementRate = totalContacts > 0 ? (recentlyEngaged / totalContacts) * 100 : 0;

  return {
    contactsByLifecycle,
    leadScoreDistribution,
    avgTimeToConversion,
    segmentOverlap,
    engagementRate,
  };
}

/**
 * Convert metrics to MetricGroup format for UI display
 */
export function formatLeadScoringMetrics(
  metrics: LeadScoringMetrics
): MetricGroup[] {
  const totalContacts = Object.values(metrics.contactsByLifecycle).reduce((a, b) => a + b, 0);

  return [
    {
      title: 'Lead Score Distribution',
      metrics: Object.entries(metrics.leadScoreDistribution).map(([range, count]) => ({
        label: range,
        value: count,
        percentage: totalContacts > 0 ? (count / totalContacts) * 100 : 0,
        severity: range === 'No Score' && (count / totalContacts) * 100 > 30 ? 'warning' : undefined,
        description: range === 'No Score'
          ? 'Contacts without a lead score. Consider implementing lead scoring to prioritize your best leads.'
          : undefined,
      })),
    },
    {
      title: 'Lifecycle Stage Distribution',
      metrics: Object.entries(metrics.contactsByLifecycle)
        .sort((a, b) => b[1] - a[1])
        .map(([stage, count]) => ({
          label: stage,
          value: count,
          percentage: (count / totalContacts) * 100,
          description: `Number of contacts in the ${stage} lifecycle stage.`,
        })),
    },
    {
      title: 'Engagement & Conversion',
      metrics: [
        {
          label: 'Engagement Rate (30 days)',
          value: `${metrics.engagementRate.toFixed(1)}%`,
          severity: metrics.engagementRate < 20 ? 'critical' : metrics.engagementRate < 40 ? 'warning' : 'good',
          description: 'Percentage of contacts that have been updated or engaged with in the last 30 days. Low engagement might indicate stale leads or inactive contacts.',
        },
        {
          label: 'Avg. Days to Convert',
          value: metrics.avgTimeToConversion['Average Days'] > 0
            ? metrics.avgTimeToConversion['Average Days']
            : 'N/A',
          description: 'Average time it takes for a lead to convert to a customer. This helps you understand your sales cycle length and set realistic expectations.',
        },
      ],
    },
  ];
}
