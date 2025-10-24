import { NextRequest, NextResponse } from 'next/server';
import { createHubSpotClient } from '@/lib/hubspot-client';
import { createClaudeClient } from '@/lib/claude-client';
import { calculateContactQualityMetrics, formatContactQualityMetrics } from '@/lib/audits/contact-quality';
import { calculatePipelineHealthMetrics, formatPipelineHealthMetrics } from '@/lib/audits/pipeline-health';
import { AuditRequest, AuditResponse, AuditType } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: AuditRequest = await request.json();
    const { auditType, hubspotToken, accountContext } = body;

    // Validate inputs
    if (!auditType || !hubspotToken) {
      return NextResponse.json(
        { error: 'Missing required fields: auditType and hubspotToken' },
        { status: 400 }
      );
    }

    // Get Claude API key from environment
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    if (!claudeApiKey) {
      return NextResponse.json(
        { error: 'Claude API key not configured on server' },
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
        { error: 'Failed to connect to HubSpot. Please check your API token.' },
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

      default:
        return NextResponse.json(
          { error: `Audit type "${auditType}" is not yet supported` },
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

    return NextResponse.json(
      {
        error: 'Audit failed',
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
