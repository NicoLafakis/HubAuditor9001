'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AuditRecord {
  id: number;
  auditType: string;
  createdAt: string;
  summary?: string;
}

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [auditHistory, setAuditHistory] = useState<AuditRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Simulated audit history - replace with actual API call
    if (user) {
      setTimeout(() => {
        setAuditHistory([
          {
            id: 1,
            auditType: 'pipeline-health',
            createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            summary: 'Analyzed 156 deals across 4 pipeline stages'
          },
          {
            id: 2,
            auditType: 'contact-quality',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            summary: 'Evaluated 2,453 contacts for data completeness'
          },
          {
            id: 3,
            auditType: 'lead-scoring',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            summary: 'Scored 892 leads based on engagement metrics'
          },
          {
            id: 4,
            auditType: 'sync-integrity',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            summary: 'Checked sync status for 3,421 records'
          },
          {
            id: 5,
            auditType: 'company-enrichment',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            summary: 'Enriched 567 company records with external data'
          },
        ]);
        setLoadingHistory(false);
      }, 500);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <div className="mb-4 text-4xl">📋</div>
          <p style={{ color: 'var(--foreground)' }}>Loading history...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getAuditIcon = (type: string) => {
    switch (type) {
      case 'pipeline-health': return '🏥';
      case 'contact-quality': return '✨';
      case 'lead-scoring': return '🎯';
      case 'company-enrichment': return '🏢';
      case 'sync-integrity': return '🔄';
      default: return '📊';
    }
  };

  const getAuditName = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            📋 Audit History
          </h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            View and manage your past audit reports
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <select
            className="px-4 py-2 rounded border"
            style={{
              background: 'var(--card)',
              color: 'var(--foreground)',
              borderColor: 'var(--card-border)',
            }}
          >
            <option>All Audit Types</option>
            <option>Pipeline Health</option>
            <option>Contact Quality</option>
            <option>Lead Scoring</option>
            <option>Company Enrichment</option>
            <option>Sync Integrity</option>
          </select>

          <select
            className="px-4 py-2 rounded border"
            style={{
              background: 'var(--card)',
              color: 'var(--foreground)',
              borderColor: 'var(--card-border)',
            }}
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>All Time</option>
          </select>

          <button
            className="px-4 py-2 rounded font-medium ml-auto"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
            }}
          >
            Export History
          </button>
        </div>

        {/* Audit History List */}
        {loadingHistory ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent mb-4" style={{ color: 'var(--primary)' }}></div>
            <p style={{ color: 'var(--muted-foreground)' }}>Loading audit history...</p>
          </div>
        ) : auditHistory.length === 0 ? (
          <div
            className="rounded-lg border p-12 text-center"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--card-border)',
            }}
          >
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              No Audit History
            </h3>
            <p className="mb-6" style={{ color: 'var(--muted-foreground)' }}>
              You haven't run any audits yet. Start your first audit to see results here.
            </p>
            <button
              className="px-6 py-3 rounded font-medium"
              style={{
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
              }}
              onClick={() => router.push('/')}
            >
              Run Your First Audit
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {auditHistory.map((audit) => (
              <div
                key={audit.id}
                className="rounded-lg border p-6 flex items-center gap-6 hover:shadow-lg transition-shadow cursor-pointer"
                style={{
                  background: 'var(--card)',
                  borderColor: 'var(--card-border)',
                }}
                onClick={() => router.push(`/audit/${audit.auditType}`)}
              >
                <div className="text-5xl">{getAuditIcon(audit.auditType)}</div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
                    {getAuditName(audit.auditType)}
                  </h3>
                  <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>
                    {audit.summary}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {formatTimestamp(audit.createdAt)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 rounded font-medium"
                    style={{
                      background: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/audit/${audit.auditType}`);
                    }}
                  >
                    View Report
                  </button>
                  <button
                    className="px-4 py-2 rounded font-medium"
                    style={{
                      background: 'var(--muted)',
                      color: 'var(--muted-foreground)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('Download feature coming soon!');
                    }}
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {auditHistory.length > 0 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              className="px-4 py-2 rounded font-medium"
              style={{
                background: 'var(--muted)',
                color: 'var(--muted-foreground)',
              }}
            >
              Previous
            </button>
            <button
              className="px-4 py-2 rounded font-medium"
              style={{
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
              }}
            >
              1
            </button>
            <button
              className="px-4 py-2 rounded font-medium"
              style={{
                background: 'var(--muted)',
                color: 'var(--muted-foreground)',
              }}
            >
              2
            </button>
            <button
              className="px-4 py-2 rounded font-medium"
              style={{
                background: 'var(--muted)',
                color: 'var(--muted-foreground)',
              }}
            >
              3
            </button>
            <button
              className="px-4 py-2 rounded font-medium"
              style={{
                background: 'var(--muted)',
                color: 'var(--muted-foreground)',
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
