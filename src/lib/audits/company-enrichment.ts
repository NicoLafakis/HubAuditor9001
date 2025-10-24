import { HubSpotCompany, HubSpotContact, CompanyEnrichmentMetrics, MetricGroup } from '@/types';

/**
 * Calculate Company Enrichment metrics
 */
export function calculateCompanyEnrichmentMetrics(
  companies: HubSpotCompany[],
  contacts?: HubSpotContact[]
): CompanyEnrichmentMetrics {
  const totalCompanies = companies.length;

  // Missing industry
  const missingIndustry = companies.filter(c => !c.properties.industry).length;
  const missingIndustryPct = totalCompanies > 0 ? (missingIndustry / totalCompanies) * 100 : 0;

  // Missing revenue
  const missingRevenue = companies.filter(c => !c.properties.annualrevenue).length;
  const missingRevenuePct = totalCompanies > 0 ? (missingRevenue / totalCompanies) * 100 : 0;

  // Missing employee count
  const missingEmployees = companies.filter(c => !c.properties.numberofemployees).length;
  const missingEmployeesPct = totalCompanies > 0 ? (missingEmployees / totalCompanies) * 100 : 0;

  // Company-Contact coverage (how many companies have at least one contact)
  let companyContactCoverage = 0;
  if (contacts && contacts.length > 0) {
    const companiesWithContacts = new Set(
      contacts
        .map(c => c.properties.associatedcompanyid)
        .filter(id => id)
    );
    companyContactCoverage = totalCompanies > 0
      ? (companiesWithContacts.size / totalCompanies) * 100
      : 0;
  }

  // Enrichment score (average completeness of key fields)
  let enrichmentScore = 0;
  if (totalCompanies > 0) {
    const keyFields = ['name', 'domain', 'industry', 'annualrevenue', 'numberofemployees'];
    const completenessScores = companies.map(company => {
      const filledFields = keyFields.filter(field => company.properties[field]).length;
      return (filledFields / keyFields.length) * 100;
    });
    enrichmentScore = completenessScores.reduce((a, b) => a + b, 0) / totalCompanies;
  }

  return {
    totalCompanies,
    missingIndustry,
    missingIndustryPct,
    missingRevenue,
    missingRevenuePct,
    companyContactCoverage,
    enrichmentScore,
  };
}

/**
 * Convert metrics to MetricGroup format for UI display
 */
export function formatCompanyEnrichmentMetrics(
  metrics: CompanyEnrichmentMetrics
): MetricGroup[] {
  return [
    {
      title: 'Overview',
      metrics: [
        {
          label: 'Total Companies',
          value: metrics.totalCompanies,
          severity: 'good',
          description: 'The total number of companies in your HubSpot database.',
        },
        {
          label: 'Overall Enrichment Score',
          value: `${metrics.enrichmentScore.toFixed(1)}%`,
          severity: metrics.enrichmentScore < 50 ? 'critical' : metrics.enrichmentScore < 70 ? 'warning' : 'good',
          description: 'Average completeness of key company fields (name, domain, industry, revenue, employee count). Higher scores mean richer company data.',
        },
      ],
    },
    {
      title: 'Missing Data',
      metrics: [
        {
          label: 'Missing Industry',
          value: metrics.missingIndustry,
          percentage: metrics.missingIndustryPct,
          severity: metrics.missingIndustryPct > 40 ? 'critical' : metrics.missingIndustryPct > 20 ? 'warning' : 'good',
          description: 'Companies without an industry classification. Industry data helps you segment your accounts and personalize your outreach.',
        },
        {
          label: 'Missing Revenue',
          value: metrics.missingRevenue,
          percentage: metrics.missingRevenuePct,
          severity: metrics.missingRevenuePct > 50 ? 'critical' : metrics.missingRevenuePct > 30 ? 'warning' : 'good',
          description: 'Companies without revenue data. This information is crucial for prioritizing high-value accounts and qualifying leads.',
        },
      ],
    },
    {
      title: 'Relationship Coverage',
      metrics: [
        {
          label: 'Companies with Contacts',
          value: `${metrics.companyContactCoverage.toFixed(1)}%`,
          severity: metrics.companyContactCoverage < 60 ? 'critical' : metrics.companyContactCoverage < 80 ? 'warning' : 'good',
          description: 'Percentage of companies that have at least one associated contact. Companies without contacts represent missed relationship opportunities.',
        },
      ],
    },
  ];
}
