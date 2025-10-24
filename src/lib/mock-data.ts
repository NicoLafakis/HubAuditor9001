import { HubSpotContact, HubSpotDeal, AuditResponse } from '@/types';

/**
 * Mock HubSpot contacts for testing
 */
export const mockContacts: HubSpotContact[] = [
  {
    id: '1',
    properties: {
      email: 'john.doe@example.com',
      phone: '+1234567890',
      firstname: 'John',
      lastname: 'Doe',
      lifecyclestage: 'lead',
      hs_email_bounce: 'false',
      hubspot_owner_id: 'owner1',
      lastmodifieddate: new Date().toISOString(),
      createdate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    properties: {
      email: 'jane.smith@example.com',
      firstname: 'Jane',
      lastname: 'Smith',
      lifecyclestage: 'customer',
      hs_email_bounce: 'true',
      lastmodifieddate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      createdate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
  },
  // Duplicate email
  {
    id: '3',
    properties: {
      email: 'john.doe@example.com',
      phone: '+0987654321',
      firstname: 'Johnny',
      lastname: 'Doe',
      lifecyclestage: 'lead',
      hubspot_owner_id: 'owner2',
      lastmodifieddate: new Date().toISOString(),
      createdate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Missing email
  {
    id: '4',
    properties: {
      phone: '+1122334455',
      firstname: 'Bob',
      lastname: 'Wilson',
      lifecyclestage: 'subscriber',
      hubspot_owner_id: 'owner1',
      lastmodifieddate: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
      createdate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Mock HubSpot deals for testing
 */
export const mockDeals: HubSpotDeal[] = [
  {
    id: '1',
    properties: {
      dealname: 'Enterprise Plan - Acme Corp',
      amount: '50000',
      closedate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      dealstage: 'qualifiedtobuy',
      pipeline: 'default',
      createdate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      hs_lastmodifieddate: new Date().toISOString(),
    },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    properties: {
      dealname: 'Starter Plan - Tech Co',
      amount: '5000',
      dealstage: 'presentationscheduled',
      pipeline: 'default',
      createdate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      hs_lastmodifieddate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    properties: {
      dealname: 'Pro Plan - Startup Inc',
      closedate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      dealstage: 'appointmentscheduled',
      pipeline: 'default',
      createdate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      hs_lastmodifieddate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Mock audit response for testing
 */
export const mockContactQualityAudit: AuditResponse = {
  auditType: 'contact-quality',
  timestamp: new Date().toISOString(),
  metrics: {
    totalContacts: 12847,
    duplicates: 247,
    duplicateRate: 1.92,
    missingEmail: 1284,
    missingEmailPct: 10.0,
    missingPhone: 3854,
    missingPhonePct: 30.0,
    hardBounceRate: 3.2,
    unassignedContacts: 1027,
    unassignedPct: 8.0,
    staleContacts: 3854,
    staleContactsPct: 30.0,
    lifecycleDistribution: {
      lead: 4523,
      subscriber: 3211,
      customer: 2847,
      evangelist: 1205,
      other: 1061,
    },
  },
  metricGroups: [
    {
      title: 'Overview',
      metrics: [
        {
          label: 'Total Contacts',
          value: 12847,
          severity: 'good',
        },
      ],
    },
    {
      title: 'Data Quality Issues',
      metrics: [
        {
          label: 'Duplicate Contacts',
          value: 247,
          percentage: 1.92,
          severity: 'good',
        },
        {
          label: 'Missing Email',
          value: 1284,
          percentage: 10.0,
          severity: 'warning',
        },
        {
          label: 'Hard Bounce Rate',
          value: '3.2%',
          severity: 'warning',
        },
      ],
    },
  ],
  analysis: `## Overview
Your HubSpot CRM shows **moderate data quality concerns** that require attention. With 12,847 contacts, you're experiencing a 10% missing email rate and 3.2% hard bounce rate, which are above industry benchmarks for B2B SaaS companies.

## Key Findings
- **Duplicate contacts (247)**: At 1.92%, this is within acceptable range but still represents wasted marketing spend
- **Missing critical data**: 10% lack email addresses, making them essentially non-contactable
- **Hard bounces (3.2%)**: Significantly above the 2% industry standard, indicating poor list hygiene
- **Stale contacts (30%)**: Nearly a third of your database hasn't been updated in 90+ days
- **Unassigned contacts (8%)**: Leads falling through the cracks without owner assignment

## Business Impact
These issues likely cost your organization:
- **$2,000-3,000/month** in wasted marketing automation and email sending costs
- **15-20 hours/week** in manual data cleanup and deduplication
- **Lost revenue opportunity** of approximately $50,000/year from unassigned and stale leads
- **Reduced email deliverability** affecting campaign performance across all contacts

## Recommendations
1. **Implement automated deduplication** using HubSpot's native tools or a third-party integration
2. **Launch a data enrichment campaign** to fill missing email addresses (consider tools like Clearbit or ZoomInfo)
3. **Set up email validation** at form entry points to prevent future hard bounces
4. **Create assignment rules** to automatically route new leads to appropriate owners
5. **Establish a quarterly data hygiene routine** to prevent future degradation`,
  accountContext: {
    industry: 'B2B SaaS',
    companyType: 'B2B',
  },
};
