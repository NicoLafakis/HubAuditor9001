'use client';

import { useState, useEffect } from 'react';
import { AuditType } from '@/types';

interface AuditOption {
  id: AuditType;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

const auditOptions: AuditOption[] = [
  {
    id: 'contact-quality',
    name: 'Contact Data Quality',
    description: 'Analyze contact completeness and data accuracy',
    icon: '👤',
    available: true,
  },
  {
    id: 'pipeline-health',
    name: 'Deal Pipeline Health',
    description: 'Evaluate pipeline stages and deal progression',
    icon: '📊',
    available: true,
  },
  {
    id: 'company-enrichment',
    name: 'Company Enrichment',
    description: 'Assess company data completeness and relationships',
    icon: '🏢',
    available: true,
  },
  {
    id: 'lead-scoring',
    name: 'Lead Scoring & Segmentation',
    description: 'Review lead scoring effectiveness and engagement',
    icon: '🎯',
    available: true,
  },
  {
    id: 'sync-integrity',
    name: 'Sync Integrity',
    description: 'Monitor integration health and data sync status',
    icon: '🔄',
    available: true,
  },
];

interface SavedToken {
  token_name: string;
  token_type: string;
  created_at: string;
}

interface AuditSelectorProps {
  onSelectAudit: (auditType: AuditType, hubspotToken: string) => void;
}

export default function AuditSelector({ onSelectAudit }: AuditSelectorProps) {
  const [selectedAudit, setSelectedAudit] = useState<AuditType | null>(null);
  const [hubspotToken, setHubspotToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [savedTokens, setSavedTokens] = useState<SavedToken[]>([]);
  const [selectedSavedToken, setSelectedSavedToken] = useState('');
  const [saveToken, setSaveToken] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  useEffect(() => {
    loadSavedTokens();
  }, []);

  const loadSavedTokens = async () => {
    setIsLoadingTokens(true);
    try {
      const response = await fetch('/api/tokens');
      if (response.ok) {
        const data = await response.json();
        setSavedTokens(data.tokens || []);
      }
    } catch (error) {
      console.error('Error loading saved tokens:', error);
    } finally {
      setIsLoadingTokens(false);
    }
  };

  const handleAuditClick = (audit: AuditOption) => {
    if (!audit.available) return;
    setSelectedAudit(audit.id);
    setShowTokenInput(true);
  };

  const handleStartAudit = async () => {
    if (!selectedAudit) return;

    let tokenToUse = hubspotToken;

    // If using a saved token, fetch it
    if (selectedSavedToken) {
      try {
        const response = await fetch(`/api/tokens/get?name=${encodeURIComponent(selectedSavedToken)}`);
        if (response.ok) {
          const data = await response.json();
          tokenToUse = data.tokenValue;
        } else {
          alert('Failed to load saved token');
          return;
        }
      } catch (error) {
        alert('Error loading saved token');
        return;
      }
    } else if (hubspotToken.trim()) {
      // Save new token if requested
      if (saveToken && tokenName.trim()) {
        try {
          await fetch('/api/tokens', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tokenName: tokenName.trim(),
              tokenValue: hubspotToken.trim(),
              tokenType: 'hubspot',
            }),
          });
          await loadSavedTokens();
        } catch (error) {
          console.error('Error saving token:', error);
        }
      }
    } else {
      return;
    }

    if (tokenToUse.trim()) {
      onSelectAudit(selectedAudit, tokenToUse);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            Select an Audit
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--muted-foreground)' }}>
            Choose the type of audit you want to run on your HubSpot account
          </p>
        </div>

        {/* Audit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {auditOptions.map((audit) => (
            <button
              key={audit.id}
              onClick={() => handleAuditClick(audit)}
              disabled={!audit.available}
              className="text-left p-6 rounded-lg border transition-all"
              style={{
                background: audit.available ? 'var(--card-background)' : 'var(--muted)',
                borderColor: selectedAudit === audit.id ? 'var(--primary)' : 'var(--card-border)',
                borderWidth: selectedAudit === audit.id ? '2px' : '1px',
                opacity: audit.available ? 1 : 0.5,
                cursor: audit.available ? 'pointer' : 'not-allowed',
              }}
              onMouseEnter={(e) => {
                if (audit.available) {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (audit.available && selectedAudit !== audit.id) {
                  e.currentTarget.style.borderColor = 'var(--card-border)';
                }
              }}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{audit.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                    {audit.name}
                    {!audit.available && (
                      <span className="ml-2 text-xs font-normal" style={{ color: 'var(--muted-foreground)' }}>
                        (Coming Soon)
                      </span>
                    )}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    {audit.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Token Input */}
        {showTokenInput && (
          <div
            className="rounded-lg p-8 max-w-2xl mx-auto border"
            style={{
              background: 'var(--card-background)',
              borderColor: 'var(--card-border)',
            }}
          >
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              HubSpot Access Token
            </h2>
            <p className="mb-6" style={{ color: 'var(--muted-foreground)' }}>
              Select a saved token or enter a new one to continue
            </p>

            {savedTokens.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                  Use Saved Token
                </label>
                <select
                  value={selectedSavedToken}
                  onChange={(e) => {
                    setSelectedSavedToken(e.target.value);
                    if (e.target.value) {
                      setHubspotToken('');
                    }
                  }}
                  className="w-full px-4 py-2 rounded-md border"
                  style={{
                    background: 'var(--input-background)',
                    border: '1px solid var(--input-border)',
                    color: 'var(--foreground)',
                  }}
                >
                  <option value="">-- Select a saved token --</option>
                  {savedTokens.map((token) => (
                    <option key={token.token_name} value={token.token_name}>
                      {token.token_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!selectedSavedToken && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
                    Enter HubSpot Token
                  </label>
                  <input
                    type="password"
                    value={hubspotToken}
                    onChange={(e) => setHubspotToken(e.target.value)}
                    placeholder="Paste your access token here"
                    className="w-full px-4 py-2 rounded-md border"
                    style={{
                      background: 'var(--input-background)',
                      border: '1px solid var(--input-border)',
                      color: 'var(--foreground)',
                    }}
                  />
                </div>

                {hubspotToken && (
                  <div className="mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveToken}
                        onChange={(e) => setSaveToken(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm" style={{ color: 'var(--foreground)' }}>
                        Save this token for future use
                      </span>
                    </label>
                    {saveToken && (
                      <input
                        type="text"
                        value={tokenName}
                        onChange={(e) => setTokenName(e.target.value)}
                        placeholder="Token name (e.g., 'Main Account')"
                        className="w-full px-4 py-2 rounded-md border mt-2"
                        style={{
                          background: 'var(--input-background)',
                          border: '1px solid var(--input-border)',
                          color: 'var(--foreground)',
                        }}
                      />
                    )}
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleStartAudit}
                disabled={!selectedSavedToken && !hubspotToken.trim()}
                className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors"
                style={{
                  background: (!selectedSavedToken && !hubspotToken.trim()) ? 'var(--muted)' : 'var(--primary)',
                  color: '#ffffff',
                  cursor: (!selectedSavedToken && !hubspotToken.trim()) ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (selectedSavedToken || hubspotToken.trim()) {
                    e.currentTarget.style.background = 'var(--primary-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedSavedToken || hubspotToken.trim()) {
                    e.currentTarget.style.background = 'var(--primary)';
                  }
                }}
              >
                Start Audit
              </button>
              <button
                onClick={() => {
                  setShowTokenInput(false);
                  setSelectedAudit(null);
                  setHubspotToken('');
                  setSelectedSavedToken('');
                  setSaveToken(false);
                  setTokenName('');
                }}
                className="px-6 py-3 rounded-lg font-medium border transition-colors"
                style={{
                  borderColor: 'var(--card-border)',
                  color: 'var(--foreground)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--muted)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
