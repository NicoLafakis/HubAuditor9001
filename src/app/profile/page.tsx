'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

type Tab = 'account' | 'security' | 'api-keys';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Account form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // API Keys state
  const [hubspotToken, setHubspotToken] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [savedTokens, setSavedTokens] = useState<Array<{ token_name: string; token_type: string; created_at: string }>>([]);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    loadSavedTokens();
  }, [user]);

  const loadSavedTokens = async () => {
    try {
      const response = await fetch('/api/tokens');
      if (response.ok) {
        const data = await response.json();
        setSavedTokens(data.tokens || []);
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAPIKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenName: tokenName || 'HubSpot API Key',
          token: hubspotToken,
          tokenType: 'hubspot',
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'API key saved securely!' });
        setHubspotToken('');
        setTokenName('');
        loadSavedTokens();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to save API key' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteToken = async (tokenName: string) => {
    if (!confirm(`Are you sure you want to delete "${tokenName}"?`)) return;

    try {
      const response = await fetch('/api/tokens', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenName }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'API key deleted' });
        loadSavedTokens();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to delete key' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔐' },
    { id: 'api-keys', label: 'API Keys', icon: '🔑' },
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="mt-2 text-muted-foreground">Manage your account, security, and API integrations</p>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-success/10 border-success'
                : 'bg-error/10 border-error'
            }`}
            style={{ color: message.type === 'success' ? 'var(--success)' : 'var(--error)' }}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-card rounded-xl shadow-sm border border-card overflow-hidden">
          <div className="border-b border-border">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMessage(null);
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground-light hover:border-muted'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Account Tab */}
            {activeTab === 'account' && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-6">Account Information</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground-light mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-input-border rounded-lg bg-input focus:ring-2 focus:border-primary transition-colors"
                      style={{ '--tw-ring-color': 'var(--primary-focus)' } as React.CSSProperties}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground-light mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-input-border rounded-lg bg-input focus:ring-2 focus:border-primary transition-colors"
                      style={{ '--tw-ring-color': 'var(--primary-focus)' } as React.CSSProperties}
                      placeholder="john@company.com"
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-6">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground-light mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-input-border rounded-lg bg-input focus:ring-2 focus:border-primary transition-colors"
                      style={{ '--tw-ring-color': 'var(--primary-focus)' } as React.CSSProperties}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-foreground-light mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-input-border rounded-lg bg-input focus:ring-2 focus:border-primary transition-colors"
                      style={{ '--tw-ring-color': 'var(--primary-focus)' } as React.CSSProperties}
                      placeholder="Minimum 8 characters"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground-light mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-input-border rounded-lg bg-input focus:ring-2 focus:border-primary transition-colors"
                      style={{ '--tw-ring-color': 'var(--primary-focus)' } as React.CSSProperties}
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'api-keys' && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">HubSpot API Keys</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Your API keys are encrypted and stored securely. They're used for running audits on your HubSpot account.
                </p>

                {/* Saved Keys List */}
                {savedTokens.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                      <span className="text-xl">🔑</span> Your Saved API Keys
                    </h3>
                    <div className="space-y-3">
                      {savedTokens.map((token) => (
                        <div
                          key={token.token_name}
                          className="flex items-center justify-between p-4 bg-card border border-card-border rounded-lg hover:border-primary transition-colors"
                        >
                          <div>
                            <p className="font-medium text-foreground">{token.token_name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Added {new Date(token.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteToken(token.token_name)}
                            className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105"
                            style={{
                              background: 'var(--error)',
                              color: 'white',
                            }}
                            title="Delete this API key"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add New Key Form */}
                <form onSubmit={handleSaveAPIKey} className="space-y-4 mb-8 p-4 bg-muted rounded-lg border border-border">
                  <h3 className="font-medium text-foreground">Add New API Key</h3>
                  
                  <div>
                    <label htmlFor="tokenName" className="block text-sm font-medium text-foreground-light mb-2">
                      Key Name (Optional)
                    </label>
                    <input
                      type="text"
                      id="tokenName"
                      value={tokenName}
                      onChange={(e) => setTokenName(e.target.value)}
                      className="w-full px-4 py-2 border border-input-border rounded-lg bg-input focus:ring-2 focus:border-primary transition-colors"
                      style={{ '--tw-ring-color': 'var(--primary-focus)' } as React.CSSProperties}
                      placeholder="e.g., Production Account, Test Environment"
                    />
                  </div>

                  <div>
                    <label htmlFor="hubspotToken" className="block text-sm font-medium text-foreground-light mb-2">
                      HubSpot API Token
                    </label>
                    <input
                      type="password"
                      id="hubspotToken"
                      value={hubspotToken}
                      onChange={(e) => setHubspotToken(e.target.value)}
                      className="w-full px-4 py-2 border border-input-border rounded-lg bg-input focus:ring-2 focus:border-primary transition-colors font-mono text-sm"
                      style={{ '--tw-ring-color': 'var(--primary-focus)' } as React.CSSProperties}
                      placeholder="pat-na1-..."
                      required
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      🔒 Your API key will be encrypted before storage
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Saving...' : '🔑 Save API Key'}
                  </button>
                </form>

                {savedTokens.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-lg">🔑 No API keys saved yet</p>
                    <p className="text-sm mt-2">Add your first HubSpot API key above to get started</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
