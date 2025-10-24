import axios, { AxiosInstance, AxiosError } from 'axios';
import { HubSpotContact, HubSpotDeal, HubSpotCompany } from '@/types';

const HUBSPOT_API_BASE = 'https://api.hubapi.com';
const RATE_LIMIT_DELAY = 100; // 100ms between requests = ~10 req/sec

export class HubSpotClient {
  private client: AxiosInstance;
  private lastRequestTime: number = 0;

  constructor(accessToken: string) {
    this.client = axios.create({
      baseURL: HUBSPOT_API_BASE,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Rate limiting: Ensure minimum delay between requests
   */
  private async rateLimitDelay(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Generic paginated fetch with retry logic
   */
  private async fetchPaginated<T>(
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<T[]> {
    const results: T[] = [];
    let after: string | undefined;
    const limit = 100; // HubSpot max per page

    try {
      do {
        await this.rateLimitDelay();

        const response = await this.client.get(endpoint, {
          params: {
            ...params,
            limit,
            ...(after && { after }),
          },
        });

        const data = response.data;
        results.push(...(data.results || []));
        after = data.paging?.next?.after;
      } while (after);

      return results;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Fetch all contacts with specified properties
   */
  async fetchContacts(properties?: string[]): Promise<HubSpotContact[]> {
    const defaultProps = [
      'email',
      'phone',
      'firstname',
      'lastname',
      'lifecyclestage',
      'hs_email_bounce',
      'hubspot_owner_id',
      'lastmodifieddate',
      'createdate',
    ];

    return this.fetchPaginated<HubSpotContact>(
      '/crm/v3/objects/contacts',
      {
        properties: (properties || defaultProps).join(','),
      }
    );
  }

  /**
   * Search contacts with filters
   */
  async searchContacts(filters: any): Promise<HubSpotContact[]> {
    await this.rateLimitDelay();

    try {
      const response = await this.client.post('/crm/v3/objects/contacts/search', {
        filterGroups: filters,
        properties: [
          'email',
          'phone',
          'firstname',
          'lastname',
          'lifecyclestage',
          'hs_email_bounce',
          'hubspot_owner_id',
        ],
        limit: 100,
      });

      return response.data.results || [];
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Fetch all deals with specified properties
   */
  async fetchDeals(properties?: string[]): Promise<HubSpotDeal[]> {
    const defaultProps = [
      'dealname',
      'amount',
      'closedate',
      'dealstage',
      'pipeline',
      'createdate',
      'hs_lastmodifieddate',
    ];

    return this.fetchPaginated<HubSpotDeal>(
      '/crm/v3/objects/deals',
      {
        properties: (properties || defaultProps).join(','),
      }
    );
  }

  /**
   * Fetch all companies with specified properties
   */
  async fetchCompanies(properties?: string[]): Promise<HubSpotCompany[]> {
    const defaultProps = [
      'name',
      'domain',
      'industry',
      'annualrevenue',
      'numberofemployees',
    ];

    return this.fetchPaginated<HubSpotCompany>(
      '/crm/v3/objects/companies',
      {
        properties: (properties || defaultProps).join(','),
      }
    );
  }

  /**
   * Get associations between contacts and companies
   */
  async getContactCompanyAssociations(contactId: string): Promise<any[]> {
    await this.rateLimitDelay();

    try {
      const response = await this.client.get(
        `/crm/v4/objects/contacts/${contactId}/associations/companies`
      );
      return response.data.results || [];
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  /**
   * Error handler with specific HubSpot error messages
   */
  private handleError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        const status = axiosError.response.status;
        const data = axiosError.response.data as any;

        switch (status) {
          case 401:
            throw new Error('Invalid HubSpot API token. Please check your credentials.');
          case 403:
            throw new Error('Access forbidden. Please check your HubSpot API permissions.');
          case 429:
            throw new Error('Rate limit exceeded. Please try again later.');
          default:
            throw new Error(data?.message || 'HubSpot API error occurred.');
        }
      } else if (axiosError.request) {
        throw new Error('No response from HubSpot API. Please check your connection.');
      }
    }

    throw new Error('An unexpected error occurred while fetching HubSpot data.');
  }

  /**
   * Test connection with a simple API call
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.rateLimitDelay();
      await this.client.get('/crm/v3/objects/contacts', {
        params: { limit: 1 },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Factory function to create a HubSpot client
 */
export function createHubSpotClient(accessToken: string): HubSpotClient {
  return new HubSpotClient(accessToken);
}
