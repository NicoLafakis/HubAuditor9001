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
    description: 'Analyze duplicates, missing data, bounce rates, and contact health',
    icon: '👤',
    available: true,
  },
  {
    id: 'pipeline-health',
    name: 'Deal Pipeline Health',
    description: 'Review pipeline stages, stuck deals, missing data, and forecast accuracy',
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            HubSpot AI Audit
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get AI-powered insights into your HubSpot CRM health. Select an audit type to begin.
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
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Enter HubSpot API Token
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              You can generate a private app access token from your HubSpot account settings.
              <a
                href="https://knowledge.hubspot.com/integrations/how-do-i-get-my-hubspot-api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                Learn more
              </a>
            </p>
            <input
              type="password"
              value={hubspotToken}
              onChange={(e) => setHubspotToken(e.target.value)}
              placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleStartAudit}
                disabled={!hubspotToken.trim()}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Start Audit
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
