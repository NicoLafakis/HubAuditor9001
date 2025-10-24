'use client';

import { useState } from 'react';
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
    description: 'Find duplicate contacts, missing info, and bad email addresses that could be hurting your outreach',
    icon: '👤',
    available: true,
  },
  {
    id: 'pipeline-health',
    name: 'Deal Pipeline Health',
    description: 'Discover stuck deals, missing forecasts, and gaps that could be costing you revenue',
    icon: '📊',
    available: true,
  },
  {
    id: 'company-enrichment',
    name: 'Company Enrichment',
    description: 'Evaluate company data completeness and enrichment opportunities',
    icon: '🏢',
    available: false,
  },
  {
    id: 'lead-scoring',
    name: 'Lead Scoring & Segmentation',
    description: 'Assess lead scoring models and segmentation effectiveness',
    icon: '🎯',
    available: false,
  },
  {
    id: 'sync-integrity',
    name: 'Sync Integrity',
    description: 'Check integration health and data synchronization status',
    icon: '🔄',
    available: false,
  },
];

interface AuditSelectorProps {
  onSelectAudit: (auditType: AuditType, hubspotToken: string) => void;
}

export default function AuditSelector({ onSelectAudit }: AuditSelectorProps) {
  const [selectedAudit, setSelectedAudit] = useState<AuditType | null>(null);
  const [hubspotToken, setHubspotToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  const handleAuditClick = (audit: AuditOption) => {
    if (!audit.available) return;
    setSelectedAudit(audit.id);
    setShowTokenInput(true);
  };

  const handleStartAudit = () => {
    if (selectedAudit && hubspotToken.trim()) {
      onSelectAudit(selectedAudit, hubspotToken);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Is Your HubSpot Healthy?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-4">
            Get a free AI audit of your HubSpot in minutes. We'll find the issues, explain what they mean, and tell you exactly how to fix them.
          </p>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            No complex reports. No technical jargon. Just clear insights you can act on today.
          </p>
        </div>

        {/* Audit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {auditOptions.map((audit) => (
            <button
              key={audit.id}
              onClick={() => handleAuditClick(audit)}
              disabled={!audit.available}
              className={`
                text-left p-6 rounded-lg shadow-md transition-all transform hover:scale-105
                ${
                  audit.available
                    ? 'bg-white hover:shadow-lg cursor-pointer'
                    : 'bg-gray-200 cursor-not-allowed opacity-60'
                }
                ${selectedAudit === audit.id ? 'ring-4 ring-blue-500' : ''}
              `}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{audit.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {audit.name}
                    {!audit.available && (
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        (Coming Soon)
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-600 text-sm">{audit.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Token Input */}
        {showTokenInput && (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Connect Your HubSpot Account
            </h2>
            <p className="text-gray-600 mb-6">
              To analyze your HubSpot data, we need a secure access key. Don't worry - this is safe and you can revoke access anytime.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <span>📋</span> Quick Setup (2 minutes)
              </h3>
              <ol className="text-sm text-blue-800 space-y-2 ml-6 list-decimal">
                <li>Go to your HubSpot Settings (click the gear icon)</li>
                <li>Navigate to: Integrations → Private Apps</li>
                <li>Click "Create private app" (or use an existing one)</li>
                <li>Give it read access to Contacts, Deals, and Companies</li>
                <li>Copy the access token and paste it below</li>
              </ol>
              <a
                href="https://knowledge.hubspot.com/integrations/how-do-i-get-my-hubspot-api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm mt-3 inline-block font-medium"
              >
                → View detailed walkthrough with screenshots
              </a>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your HubSpot Access Token
            </label>
            <input
              type="password"
              value={hubspotToken}
              onChange={(e) => setHubspotToken(e.target.value)}
              placeholder="Paste your access token here"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2 text-base"
            />
            <p className="text-xs text-gray-500 mb-6">
              🔒 Your token is encrypted and never stored. We only use it to read your HubSpot data during this audit.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleStartAudit}
                disabled={!hubspotToken.trim()}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                🚀 Start My Audit
              </button>
              <button
                onClick={() => {
                  setShowTokenInput(false);
                  setSelectedAudit(null);
                  setHubspotToken('');
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
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
