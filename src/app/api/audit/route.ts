import { NextRequest, NextResponse } from 'next/server';
import { createHubSpotClient } from '@/lib/hubspot-client';
import { createClaudeClient } from '@/lib/claude-client';
import { calculateContactQualityMetrics, formatContactQualityMetrics } from '@/lib/audits/contact-quality';
import { calculatePipelineHealthMetrics, formatPipelineHealthMetrics } from '@/lib/audits/pipeline-health';
import { calculateCompanyEnrichmentMetrics, formatCompanyEnrichmentMetrics } from '@/lib/audits/company-enrichment';
import { calculateLeadScoringMetrics, formatLeadScoringMetrics } from '@/lib/audits/lead-scoring';
import { calculateSyncIntegrityMetrics, formatSyncIntegrityMetrics } from '@/lib/audits/sync-integrity';
import { AuditRequest, AuditResponse, AuditType } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: AuditRequest = await request.json();
    const { auditType, hubspotToken, accountContext } = body;

    // Validate inputs
    if (!auditType || !hubspotToken) {
      return NextResponse.json(
        { error: 'Oops! It looks like we\'re missing some information. Please make sure you\'ve selected an audit type and entered your HubSpot access token.' },
        { status: 400 }
      );
    }

    // Get Claude API key from environment
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    if (!claudeApiKey) {
      return NextResponse.json(
        { error: 'Hmm, there seems to be a configuration issue on our end. Please contact support or try again later.' },
        { status: 500 }
      );
    }

    // Initialize clients
    const hubspotClient = createHubSpotClient(hubspotToken);
    const claudeClient = createClaudeClient(claudeApiKey);

    // Test HubSpot connection
    const hubspotConnected = await hubspotClient.testConnection();
    if (!hubspotConnected) {
      return NextResponse.json(
        { error: 'We couldn\'t connect to your HubSpot account. Please double-check that your access token is correct and has the right permissions (Contacts, Deals, and Companies read access).' },
        { status: 401 }
      );
    }

    // Run the appropriate audit
    let metrics: any;
    let metricGroups: any[];

    switch (auditType) {
      case 'contact-quality':
        const contacts = await hubspotClient.fetchContacts();
        metrics = calculateContactQualityMetrics(contacts);
        metricGroups = formatContactQualityMetrics(metrics);
        break;

      case 'pipeline-health':
        const deals = await hubspotClient.fetchDeals();
        metrics = calculatePipelineHealthMetrics(deals);
        metricGroups = formatPipelineHealthMetrics(metrics);
        break;

      case 'company-enrichment':
        const companies = await hubspotClient.fetchCompanies();
        const contactsForCompanies = await hubspotClient.fetchContacts(['associatedcompanyid']);
        metrics = calculateCompanyEnrichmentMetrics(companies, contactsForCompanies);
        metricGroups = formatCompanyEnrichmentMetrics(metrics);
        break;

      case 'lead-scoring':
        const contactsForScoring = await hubspotClient.fetchContacts([
          'email',
          'firstname',
          'lastname',
          'lifecyclestage',
          'hs_lead_score',
          'hubspotscore',
          'lastmodifieddate',
          'createdate',
        ]);
        metrics = calculateLeadScoringMetrics(contactsForScoring);
        metricGroups = formatLeadScoringMetrics(metrics);
        break;

      case 'sync-integrity':
        // Note: Sync integrity requires special API access to integration endpoints
        // For now, we'll pass undefined to get placeholder metrics
        metrics = calculateSyncIntegrityMetrics();
        metricGroups = formatSyncIntegrityMetrics(metrics);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown audit type: ${auditType}` },
          { status: 400 }
        );
    }

    // Generate AI analysis
    const analysis = await claudeClient.generateAnalysis({
      auditType,
      metrics,
      accountContext,
    });

    // Build response
    const response: AuditResponse = {
      auditType,
      timestamp: new Date().toISOString(),
      metrics,
      metricGroups,
      analysis,
      accountContext,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Audit API error:', error);

    // Provide helpful error messages for common issues
    let userMessage = 'Something unexpected happened while running your audit. Please try again in a moment.';

    if (error.message?.includes('rate limit')) {
      userMessage = 'Whoa! We\'re getting too many requests right now. Please wait a minute and try again.';
    } else if (error.message?.includes('timeout')) {
      userMessage = 'This is taking longer than expected. Your HubSpot might have a lot of data! Please try again.';
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      userMessage = 'We\'re having trouble connecting. Please check your internet connection and try again.';
    }

    return NextResponse.json(
      {
        error: userMessage,
        message: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
