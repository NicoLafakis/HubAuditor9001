'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import LoadingState from '@/components/LoadingState';

interface UserData {
  id: number;
  email: string;
  name?: string;
  role: string;
  created_at: string;
}

interface Stats {
  totalUsers: number;
  totalAudits: number;
  recentAudits: Array<{ user_email: string; audit_type: string; created_at: string }>;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }

    loadAdminData();
  }, [user, router]);

  const loadAdminData = async () => {
    try {
      // Load all users
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users);
      }

      // Load stats
      const statsResponse = await fetch('/api/admin/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading Admin Panel..." />;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const auditTypeNames: Record<string, string> = {
    'contact-quality': 'Contact Data Quality',
    'pipeline-health': 'Deal Pipeline Health',
    'company-enrichment': 'Company Enrichment',
    'lead-scoring': 'Lead Scoring',
    'sync-integrity': 'Sync Integrity',
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">👑 Admin Panel</h1>
          <p className="text-muted-foreground">
            Monitor user activity and application statistics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-xl p-6 border border-card-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">👥</div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold text-foreground">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-6 border border-card-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">📊</div>
              <div>
                <p className="text-sm text-muted-foreground">Total Audits Run</p>
                <p className="text-3xl font-bold text-foreground">{stats?.totalAudits || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-xl border border-card-border mb-8">
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-semibold text-foreground">All Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((userData) => (
                  <tr key={userData.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm"
                          style={{
                            background: userData.role === 'admin' ? 'var(--warning)' : 'var(--primary)',
                            color: '#ffffff',
                          }}
                        >
                          {userData.name?.[0]?.toUpperCase() || userData.email[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {userData.name || 'No name'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-light">
                      {userData.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: userData.role === 'admin' ? 'var(--warning)' : 'var(--primary)',
                          color: '#ffffff',
                          opacity: 0.9,
                        }}
                      >
                        {userData.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(userData.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-xl border border-card-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-semibold text-foreground">Recent Audit Activity</h2>
          </div>
          <div className="p-6">
            {stats?.recentAudits && stats.recentAudits.length > 0 ? (
              <div className="space-y-3">
                {stats.recentAudits.map((audit, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📊</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {auditTypeNames[audit.audit_type] || audit.audit_type}
                        </p>
                        <p className="text-xs text-muted-foreground">{audit.user_email}</p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(audit.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>📊 No audits run yet</p>
                <p className="text-sm mt-2">Activity will appear here as users run audits</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
