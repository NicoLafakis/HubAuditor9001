import { SyncIntegrityMetrics, MetricGroup } from '@/types';

/**
 * Calculate Sync Integrity metrics
 * Note: This is a simplified implementation since HubSpot's sync/integration data
 * requires specific API endpoints that may not be available in all access tokens.
 */
export function calculateSyncIntegrityMetrics(
  integrationData?: any
): SyncIntegrityMetrics {
  // In a real implementation, you would fetch integration sync status
  // from HubSpot's integrations API endpoints

  // For now, we'll provide placeholder metrics that indicate
  // this feature would need additional API access

  const activeIntegrations = integrationData?.integrations?.length || 0;
  const recentSyncErrors = 0;
  const failedRecords: Record<string, number> = {};
  const propertyMappingCoverage = 0;
  const lastSuccessfulSync = integrationData?.lastSync || 'Unknown';

  return {
    activeIntegrations,
    recentSyncErrors,
    failedRecords,
    propertyMappingCoverage,
    lastSuccessfulSync,
  };
}

/**
 * Convert metrics to MetricGroup format for UI display
 */
export function formatSyncIntegrityMetrics(
  metrics: SyncIntegrityMetrics
): MetricGroup[] {
  return [
    {
      title: 'Integration Overview',
      metrics: [
        {
          label: 'Active Integrations',
          value: metrics.activeIntegrations > 0 ? metrics.activeIntegrations : 'Data Not Available',
          severity: metrics.activeIntegrations > 0 ? 'good' : 'warning',
          description: 'Number of active integrations syncing with HubSpot. Note: This audit requires additional API permissions to access integration data.',
        },
      ],
    },
    {
      title: 'Sync Health',
      metrics: [
        {
          label: 'Recent Sync Errors',
          value: metrics.activeIntegrations > 0 ? metrics.recentSyncErrors : 'N/A',
          severity: metrics.recentSyncErrors > 10 ? 'critical' : metrics.recentSyncErrors > 5 ? 'warning' : 'good',
          description: 'Number of sync errors in the past 7 days. Sync errors can lead to data inconsistencies between systems.',
        },
        {
          label: 'Property Mapping Coverage',
          value: metrics.activeIntegrations > 0 ? `${metrics.propertyMappingCoverage}%` : 'N/A',
          severity: metrics.propertyMappingCoverage < 70 ? 'warning' : 'good',
          description: 'Percentage of fields properly mapped between integrated systems. Low coverage means some data might not be syncing correctly.',
        },
      ],
    },
    {
      title: 'Sync Status',
      metrics: [
        {
          label: 'Last Successful Sync',
          value: metrics.lastSuccessfulSync,
          description: 'Timestamp of the most recent successful sync across all integrations.',
        },
      ],
    },
    {
      title: 'Important Note',
      metrics: [
        {
          label: 'API Access Required',
          value: 'Limited Data',
          severity: 'warning',
          description: 'Full sync integrity analysis requires additional HubSpot API permissions. To get detailed sync reports, you may need to configure integration-specific API access or use HubSpot\'s native integration monitoring tools.',
        },
      ],
    },
  ];
}
