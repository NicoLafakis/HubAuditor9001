# HubSpot AI Audit

An **AI-powered HubSpot CRM auditing web application** that combines quantitative data extraction via the HubSpot API with qualitative AI analysis powered by Claude AI. Get comprehensive insights into your CRM health with strategic recommendations that feel like a consulting session, not just a data report.

![HubSpot AI Audit](https://img.shields.io/badge/Next.js-15.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)

## Features

### Current Audit Types (MVP)

#### 1. Contact Data Quality Audit
Analyze your contact database health with metrics including:
- Duplicate detection and rate
- Missing email/phone percentages
- Hard bounce rates
- Unassigned contact tracking
- Stale contact identification (90+ days)
- Lifecycle stage distribution

#### 2. Deal Pipeline Health Audit
Review your sales pipeline performance with:
- Deals by stage breakdown
- Average deal age by stage
- Stuck deal identification (30+ days)
- Missing close dates and amounts
- Total pipeline value calculation
- Forecast accuracy insights

### AI-Powered Analysis
Each audit includes Claude AI-generated strategic insights:
- Risk assessment relative to industry benchmarks
- Root cause analysis of issues
- Quantified business impact
- Actionable remediation roadmap prioritized by ROI
- Industry-specific recommendations

## Tech Stack

- **Frontend:** React 18, Next.js 15 (App Router), TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Next.js API Routes
- **External APIs:**
  - HubSpot CRM API (data extraction)
  - Anthropic Claude API (AI analysis)
- **Package Manager:** npm

## Prerequisites

- Node.js 18+ installed
- HubSpot account with private app access token
- Anthropic Claude API key

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hubspot-audit.git
cd hubspot-audit
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Claude API key:

```env
CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Getting API Keys

### HubSpot API Token

1. Log into your HubSpot account
2. Navigate to **Settings** → **Integrations** → **Private Apps**
3. Click **Create a private app**
4. Give it a name (e.g., "CRM Audit Tool")
5. Under **Scopes**, enable:
   - `crm.objects.contacts.read`
   - `crm.objects.companies.read`
   - `crm.objects.deals.read`
6. Click **Create app** and copy the access token

[Learn more about HubSpot Private Apps](https://developers.hubspot.com/docs/api/private-apps)

### Claude API Key

1. Sign up at [Anthropic Console](https://console.anthropic.com/)
2. Navigate to **API Keys**
3. Click **Create Key**
4. Copy your API key (starts with `sk-ant-api03-`)

## Usage

1. **Launch the app** at `http://localhost:3000`
2. **Select an audit type** (Contact Quality or Pipeline Health)
3. **Enter your HubSpot API token** when prompted
4. **Wait for analysis** (typically 20-30 seconds)
5. **Review results:**
   - **Left Sidebar:** Quantitative metrics with color-coded severity
   - **Main Panel:** AI-generated strategic analysis and recommendations
6. **Export report** (optional, via the Export button)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── audit/
│   │       └── route.ts           # Main audit API endpoint
│   ├── audit/
│   │   └── [type]/
│   │       └── page.tsx           # Dynamic audit results page
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home page
├── components/
│   ├── AuditLayout.tsx            # Two-column layout
│   ├── AuditSelector.tsx          # Audit type selection UI
│   ├── AnalysisPanel.tsx          # AI analysis display
│   ├── ErrorDisplay.tsx           # Error handling UI
│   ├── LoadingState.tsx           # Loading spinner
│   ├── MetricCard.tsx             # Individual metric display
│   └── MetricsSidebar.tsx         # Sidebar with metrics
├── lib/
│   ├── audits/
│   │   ├── contact-quality.ts     # Contact audit logic
│   │   └── pipeline-health.ts     # Pipeline audit logic
│   ├── claude-client.ts           # Claude API wrapper
│   ├── hubspot-client.ts          # HubSpot API wrapper
│   └── mock-data.ts               # Sample data for testing
├── types/
│   └── index.ts                   # TypeScript type definitions
└── styles/
    └── globals.css                # Global styles + Tailwind
```

## Configuration

### Rate Limiting

The HubSpot client automatically rate-limits requests to ~10 req/sec to comply with HubSpot's API limits. This is configured in `src/lib/hubspot-client.ts`.

### Custom Prompts

Claude AI prompts can be customized in `src/lib/claude-client.ts` in the `buildPrompt()` method.

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Testing with Mock Data

Mock data is available in `src/lib/mock-data.ts` for testing the UI without real API calls.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variable:
   - `CLAUDE_API_KEY`: Your Anthropic API key
4. Deploy!

### Other Platforms

The app can be deployed to any platform supporting Next.js 15:
- Netlify
- AWS Amplify
- Docker container
- Self-hosted Node.js server

## Roadmap

### Phase 2 Features (Coming Soon)
- [ ] Company Enrichment Audit
- [ ] Lead Scoring & Segmentation Audit
- [ ] Sync Integrity Audit
- [ ] OAuth flow for HubSpot authentication
- [ ] Audit history and trend tracking
- [ ] PDF report export
- [ ] Multi-account support
- [ ] Custom audit builder
- [ ] Scheduled audits

## Troubleshooting

### "Invalid HubSpot API token"
- Verify your token has the correct scopes enabled
- Check that the token hasn't expired
- Ensure you're using a private app token, not an API key

### "Claude API error"
- Confirm your Claude API key is correctly set in `.env.local`
- Check your Anthropic account has available credits
- Verify the API key hasn't been revoked

### "No audit data available"
- Clear your browser's sessionStorage
- Start from the home page and re-enter your token
- Check browser console for specific error messages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Email: support@yourdomain.com

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [Anthropic Claude](https://www.anthropic.com/)
- Data from [HubSpot CRM API](https://developers.hubspot.com/)

---

**Made with Claude Code** 🤖
