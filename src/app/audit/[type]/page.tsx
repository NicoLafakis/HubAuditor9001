'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuditLayout from '@/components/AuditLayout';
import MetricsSidebar from '@/components/MetricsSidebar';
import AnalysisPanel from '@/components/AnalysisPanel';
import LoadingState from '@/components/LoadingState';
import ErrorDisplay from '@/components/ErrorDisplay';
import { AuditResponse, AuditType } from '@/types';

export default function AuditPage() {
  const params = useParams();
  const router = useRouter();
  const auditType = params.type as AuditType;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);

  useEffect(() => {
    runAudit();
  }, [auditType]);

  const runAudit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get token from sessionStorage
      const hubspotToken = sessionStorage.getItem('hubspotToken');

      if (!hubspotToken) {
        setError('Oops! It looks like you navigated here directly. Please go back to the home page and start a new audit.');
        setLoading(false);
        return;
      }

      // Call audit API
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auditType,
          hubspotToken,
          accountContext: {
            // Optional: could be collected from user
            industry: undefined,
            companyType: undefined,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Audit failed');
      }

      const data: AuditResponse = await response.json();
      setAuditData(data);
    } catch (err: any) {
      console.error('Audit error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    runAudit();
  };

  // Loading state
  if (loading) {
    return <LoadingState message="Analyzing Your HubSpot..." />;
  }

  // Error state
  if (error) {
    return <ErrorDisplay error={error} onRetry={handleRetry} />;
  }

  // No data state
  if (!auditData) {
    return <ErrorDisplay error="Hmm, we didn't get any results from your audit. Please try again." />;
  }

  // Success state - show results
  return (
    <AuditLayout
      sidebar={<MetricsSidebar metricGroups={auditData.metricGroups} />}
      content={
        <AnalysisPanel
          analysis={auditData.analysis}
          auditType={auditData.auditType}
          timestamp={auditData.timestamp}
        />
      }
    />
  );
}
