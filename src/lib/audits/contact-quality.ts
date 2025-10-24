import { HubSpotContact, ContactQualityMetrics, MetricGroup } from '@/types';

/**
 * Calculate Contact Data Quality metrics
 */
export function calculateContactQualityMetrics(
  contacts: HubSpotContact[]
): ContactQualityMetrics {
  const totalContacts = contacts.length;

  // Calculate duplicates (by email)
  const emailMap = new Map<string, number>();
  contacts.forEach(contact => {
    const email = contact.properties.email?.toLowerCase();
    if (email) {
      emailMap.set(email, (emailMap.get(email) || 0) + 1);
    }
  });

  const duplicates = Array.from(emailMap.values()).reduce(
    (sum, count) => sum + (count > 1 ? count - 1 : 0),
    0
  );
  const duplicateRate = totalContacts > 0 ? (duplicates / totalContacts) * 100 : 0;

  // Missing email
  const missingEmail = contacts.filter(c => !c.properties.email).length;
  const missingEmailPct = totalContacts > 0 ? (missingEmail / totalContacts) * 100 : 0;

  // Missing phone
  const missingPhone = contacts.filter(c => !c.properties.phone).length;
  const missingPhonePct = totalContacts > 0 ? (missingPhone / totalContacts) * 100 : 0;

  // Hard bounce rate
  const hardBounces = contacts.filter(
    c => c.properties.hs_email_bounce === 'true'
  ).length;
  const hardBounceRate = totalContacts > 0 ? (hardBounces / totalContacts) * 100 : 0;

  // Unassigned contacts
  const unassignedContacts = contacts.filter(c => !c.properties.hubspot_owner_id).length;
  const unassignedPct = totalContacts > 0 ? (unassignedContacts / totalContacts) * 100 : 0;

  // Stale contacts (not modified in 90+ days)
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const staleContacts = contacts.filter(c => {
    const lastModified = c.properties.lastmodifieddate;
    if (!lastModified) return true;
    return new Date(lastModified).getTime() < ninetyDaysAgo;
  }).length;
  const staleContactsPct = totalContacts > 0 ? (staleContacts / totalContacts) * 100 : 0;

  // Lifecycle stage distribution
  const lifecycleDistribution: Record<string, number> = {};
  contacts.forEach(contact => {
    const stage = contact.properties.lifecyclestage || 'Unknown';
    lifecycleDistribution[stage] = (lifecycleDistribution[stage] || 0) + 1;
  });

  return {
    totalContacts,
    duplicates,
    duplicateRate,
    missingEmail,
    missingEmailPct,
    missingPhone,
    missingPhonePct,
    hardBounceRate,
    unassignedContacts,
    unassignedPct,
    staleContacts,
    staleContactsPct,
    lifecycleDistribution,
  };
}

/**
 * Convert metrics to MetricGroup format for UI display
 */
export function formatContactQualityMetrics(
  metrics: ContactQualityMetrics
): MetricGroup[] {
  return [
    {
      title: 'Overview',
      metrics: [
        {
          label: 'Total Contacts',
          value: metrics.totalContacts,
          severity: 'good',
        },
      ],
    },
    {
      title: 'Data Quality Issues',
      metrics: [
        {
          label: 'Duplicate Contacts',
          value: metrics.duplicates,
          percentage: metrics.duplicateRate,
          severity: metrics.duplicateRate > 5 ? 'critical' : metrics.duplicateRate > 2 ? 'warning' : 'good',
        },
        {
          label: 'Missing Email',
          value: metrics.missingEmail,
          percentage: metrics.missingEmailPct,
          severity: metrics.missingEmailPct > 20 ? 'critical' : metrics.missingEmailPct > 10 ? 'warning' : 'good',
        },
        {
          label: 'Missing Phone',
          value: metrics.missingPhone,
          percentage: metrics.missingPhonePct,
          severity: metrics.missingPhonePct > 30 ? 'warning' : 'good',
        },
        {
          label: 'Hard Bounce Rate',
          value: `${metrics.hardBounceRate.toFixed(1)}%`,
          severity: metrics.hardBounceRate > 5 ? 'critical' : metrics.hardBounceRate > 2 ? 'warning' : 'good',
        },
      ],
    },
    {
      title: 'Contact Management',
      metrics: [
        {
          label: 'Unassigned Contacts',
          value: metrics.unassignedContacts,
          percentage: metrics.unassignedPct,
          severity: metrics.unassignedPct > 15 ? 'warning' : 'good',
        },
        {
          label: 'Stale Contacts (90+ days)',
          value: metrics.staleContacts,
          percentage: metrics.staleContactsPct,
          severity: metrics.staleContactsPct > 30 ? 'warning' : 'good',
        },
      ],
    },
    {
      title: 'Lifecycle Distribution',
      metrics: Object.entries(metrics.lifecycleDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([stage, count]) => ({
          label: stage,
          value: count,
          percentage: (count / metrics.totalContacts) * 100,
        })),
    },
  ];
}
