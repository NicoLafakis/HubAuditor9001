import Anthropic from '@anthropic-ai/sdk';
import { ClaudeAnalysisRequest } from '@/types';

const DEFAULT_MODEL = 'claude-sonnet-4-5-20250929';
const MAX_TOKENS = 4096;

export class ClaudeClient {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey,
    });
  }

  /**
   * Generate AI analysis based on audit metrics
   */
  async generateAnalysis(request: ClaudeAnalysisRequest): Promise<string> {
    try {
      const prompt = this.buildPrompt(request);

      const message = await this.client.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Extract text content from the response
      const textContent = message.content.find(block => block.type === 'text');

      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text content in Claude response');
      }

      return textContent.text;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Build the prompt based on audit type and metrics
   */
  private buildPrompt(request: ClaudeAnalysisRequest): string {
    const { auditType, metrics, accountContext } = request;

    const contextString = accountContext
      ? `
ACCOUNT CONTEXT:
- Industry: ${accountContext.industry || 'Not specified'}
- Company Type: ${accountContext.companyType || 'Not specified'}
- Estimated ARR: ${accountContext.estimatedARR || 'Not specified'}
- Team Size: ${accountContext.teamSize || 'Not specified'}
`
      : '';

    const basePrompt = `You are a HubSpot CRM expert auditing a company's CRM data.

${contextString}

AUDIT TYPE: ${this.getAuditTypeName(auditType)}

QUANTITATIVE METRICS:
${this.formatMetrics(metrics)}

Based on these metrics${accountContext ? ` for a ${accountContext.industry || ''} ${accountContext.companyType || ''} business` : ''}:

1. **Assess Data Health**: Evaluate whether the current state is good, concerning, or critical
2. **Identify Root Causes**: Explain the likely reasons for key issues
3. **Quantify Business Impact**: Estimate the real-world cost or impact of these issues (e.g., lost revenue, wasted effort)
4. **Provide Actionable Recommendations**: Give 3-5 specific, prioritized steps to improve, ordered by ROI
5. **Benchmark Against Industry**: Compare to typical ${accountContext?.industry || 'industry'} standards if applicable

Respond in structured markdown with clear sections:
- **Overview** (2-3 sentences summarizing overall health)
- **Key Findings** (bullet points of critical issues)
- **Business Impact** (quantified costs/risks)
- **Recommendations** (numbered list of actionable steps)

Be specific, data-driven, and actionable. Avoid generic advice.`;

    return basePrompt;
  }

  /**
   * Get human-readable audit type name
   */
  private getAuditTypeName(auditType: string): string {
    const names: Record<string, string> = {
      'contact-quality': 'Contact Data Quality',
      'pipeline-health': 'Deal Pipeline Health',
      'company-enrichment': 'Company Enrichment',
      'lead-scoring': 'Lead Scoring & Segmentation',
      'sync-integrity': 'Sync Integrity',
    };

    return names[auditType] || auditType;
  }

  /**
   * Format metrics object into readable string
   */
  private formatMetrics(metrics: any): string {
    const lines: string[] = [];

    for (const [key, value] of Object.entries(metrics)) {
      const label = this.formatLabel(key);

      if (typeof value === 'object' && value !== null) {
        lines.push(`\n${label}:`);
        for (const [subKey, subValue] of Object.entries(value)) {
          lines.push(`  - ${this.formatLabel(subKey)}: ${subValue}`);
        }
      } else {
        lines.push(`- ${label}: ${value}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Convert camelCase to Title Case with spaces
   */
  private formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/Pct$/, '%')
      .replace(/Avg/g, 'Average')
      .trim();
  }

  /**
   * Error handler for Claude API errors
   */
  private handleError(error: unknown): void {
    if (error instanceof Anthropic.APIError) {
      const status = error.status;

      switch (status) {
        case 401:
          throw new Error('Invalid Claude API key. Please check your credentials.');
        case 429:
          throw new Error('Claude API rate limit exceeded. Please try again later.');
        case 500:
          throw new Error('Claude API server error. Please try again later.');
        default:
          throw new Error(error.message || 'Claude API error occurred.');
      }
    }

    throw new Error('An unexpected error occurred while generating AI analysis.');
  }

  /**
   * Test connection to Claude API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Hello',
          },
        ],
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Factory function to create a Claude client
 */
export function createClaudeClient(apiKey: string): ClaudeClient {
  return new ClaudeClient(apiKey);
}
