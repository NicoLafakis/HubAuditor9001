// Audit Types
export type AuditType =
  | 'contact-quality'
  | 'pipeline-health'
  | 'company-enrichment'
  | 'lead-scoring'
  | 'sync-integrity';

// HubSpot API Types
export interface HubSpotContact {
  id: string;
  properties: {
    email?: string;
    phone?: string;
    firstname?: string;
    lastname?: string;
    lifecyclestage?: string;
    hs_email_bounce?: string;
    hubspot_owner_id?: string;
    lastmodifieddate?: string;
    createdate?: string;
    [key: string]: string | undefined;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HubSpotDeal {
  id: string;
  properties: {
    dealname?: string;
    amount?: string;
    closedate?: string;
    dealstage?: string;
    pipeline?: string;
    createdate?: string;
    hs_lastmodifieddate?: string;
    [key: string]: string | undefined;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HubSpotCompany {
  id: string;
  properties: {
    name?: string;
    domain?: string;
    industry?: string;
    annualrevenue?: string;
    numberofemployees?: string;
    [key: string]: string | undefined;
  };
  createdAt: string;
  updatedAt: string;
}

// Metric Types
export interface MetricCard {
  label: string;
  value: string | number;
  percentage?: number;
  trend?: 'up' | 'down' | 'neutral';
  severity?: 'good' | 'warning' | 'critical';
  description?: string; // Plain English explanation of what this metric means
}

export interface MetricGroup {
  title: string;
  metrics: MetricCard[];
}

// Contact Quality Audit Types
export interface ContactQualityMetrics {
  totalContacts: number;
  duplicates: number;
  duplicateRate: number;
  missingEmail: number;
  missingEmailPct: number;
  missingPhone: number;
  missingPhonePct: number;
  hardBounceRate: number;
  unassignedContacts: number;
  unassignedPct: number;
  staleContacts: number;
  staleContactsPct: number;
  lifecycleDistribution: Record<string, number>;
}

// Pipeline Health Audit Types
export interface PipelineHealthMetrics {
  totalDeals: number;
  dealsByStage: Record<string, number>;
  avgDealAgeByStage: Record<string, number>;
  stuckDeals: number;
  stuckDealsPct: number;
  missingCloseDate: number;
  missingCloseDatePct: number;
  missingAmount: number;
  missingAmountPct: number;
  totalPipelineValue: number;
}

// Company Enrichment Audit Types
export interface CompanyEnrichmentMetrics {
  totalCompanies: number;
  missingIndustry: number;
  missingIndustryPct: number;
  missingRevenue: number;
  missingRevenuePct: number;
  companyContactCoverage: number;
  enrichmentScore: number;
}

// Lead Scoring Audit Types
export interface LeadScoringMetrics {
  contactsByLifecycle: Record<string, number>;
  leadScoreDistribution: Record<string, number>;
  avgTimeToConversion: Record<string, number>;
  segmentOverlap: number;
  engagementRate: number;
}

// Sync Integrity Audit Types
export interface SyncIntegrityMetrics {
  activeIntegrations: number;
  recentSyncErrors: number;
  failedRecords: Record<string, number>;
  propertyMappingCoverage: number;
  lastSuccessfulSync: string;
}

// Account Context
export interface AccountContext {
  industry?: string;
  companyType?: 'B2B' | 'B2C' | 'B2B2C';
  estimatedARR?: string;
  teamSize?: string;
}

// Audit Request & Response
export interface AuditRequest {
  auditType: AuditType;
  hubspotToken: string;
  accountContext?: AccountContext;
}

export interface AuditResponse {
  auditType: AuditType;
  timestamp: string;
  metrics: ContactQualityMetrics | PipelineHealthMetrics | CompanyEnrichmentMetrics | LeadScoringMetrics | SyncIntegrityMetrics;
  metricGroups: MetricGroup[];
  analysis: string;
  accountContext?: AccountContext;
  error?: string;
}

// API Error Response
export interface APIError {
  error: string;
  message: string;
  statusCode: number;
}

// Claude Analysis Request
export interface ClaudeAnalysisRequest {
  auditType: AuditType;
  metrics: any;
  accountContext?: AccountContext;
}
