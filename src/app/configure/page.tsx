'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ConfigurePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center">
          <div className="mb-4 text-4xl">⚙️</div>
          <p style={{ color: 'var(--foreground)' }}>Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            ⚙️ Configuration
          </h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Manage your audit settings and preferences
          </p>
        </div>

        {/* Configuration Sections */}
        <div className="grid gap-6">
          {/* Audit Settings */}
          <div
            className="rounded-lg border p-6"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--card-border)',
            }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              📋 Audit Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded" style={{ background: 'var(--background)' }}>
                <div>
                  <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>Auto-refresh Results</h3>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Automatically refresh audit data every 5 minutes</p>
                </div>
                <label className="relative inline-block w-12 h-6">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-full h-full rounded-full peer-checked:bg-[var(--primary)] bg-[var(--muted)]" style={{ transition: 'all 0.3s' }}></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 rounded" style={{ background: 'var(--background)' }}>
                <div>
                  <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>Email Notifications</h3>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Receive email alerts when audits complete</p>
                </div>
                <label className="relative inline-block w-12 h-6">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-full h-full rounded-full peer-checked:bg-[var(--primary)] bg-[var(--muted)]" style={{ transition: 'all 0.3s' }}></div>
                </label>
              </div>
            </div>
          </div>

          {/* HubSpot Connection */}
          <div
            className="rounded-lg border p-6"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--card-border)',
            }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              🔗 HubSpot Connection
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded" style={{ background: 'var(--background)' }}>
                <div>
                  <h3 className="font-medium" style={{ color: 'var(--foreground)' }}>API Token Status</h3>
                  <p className="text-sm" style={{ color: 'var(--success)' }}>✓ Connected and verified</p>
                </div>
                <button
                  className="px-4 py-2 rounded font-medium"
                  style={{
                    background: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                  }}
                >
                  Update Token
                </button>
              </div>
            </div>
          </div>

          {/* Display Preferences */}
          <div
            className="rounded-lg border p-6"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--card-border)',
            }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              🎨 Display Preferences
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded" style={{ background: 'var(--background)' }}>
                <label className="block mb-2 font-medium" style={{ color: 'var(--foreground)' }}>
                  Default Audit View
                </label>
                <select
                  className="w-full p-2 rounded border"
                  style={{
                    background: 'var(--card)',
                    color: 'var(--foreground)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  <option>Pipeline Health</option>
                  <option>Contact Quality</option>
                  <option>Lead Scoring</option>
                  <option>Company Enrichment</option>
                  <option>Sync Integrity</option>
                </select>
              </div>

              <div className="p-4 rounded" style={{ background: 'var(--background)' }}>
                <label className="block mb-2 font-medium" style={{ color: 'var(--foreground)' }}>
                  Results Per Page
                </label>
                <select
                  className="w-full p-2 rounded border"
                  style={{
                    background: 'var(--card)',
                    color: 'var(--foreground)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            className="px-6 py-3 rounded font-medium"
            style={{
              background: 'var(--muted)',
              color: 'var(--muted-foreground)',
            }}
          >
            Cancel
          </button>
          <button
            className="px-6 py-3 rounded font-medium"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
