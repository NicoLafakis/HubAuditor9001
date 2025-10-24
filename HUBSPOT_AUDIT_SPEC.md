# HubSpot AI Audit WPA - Project Abstract & Specification

## Vision
Build an **all-in-one HubSpot CRM auditing web app** that combines quantitative data extraction via HubSpot API with qualitative AI-powered analysis. Users select an audit type, get quantitative metrics in a sidebar, and receive industry-contextualized strategic insights in the main content area—delivered by Claude AI inference.

**Goal:** Make CRM health assessment so insightful and actionable that results feel like a strategic consulting session, not a data report.

---

## Core Architecture

```
Frontend (React 18 + TypeScript + Tailwind CSS)
├─ Audit Type Selector (Push-button UI)
├─ Left Sidebar (Quantitative Data Display)
├─ Main Content (Qualitative AI Analysis)
└─ Loading/Error States

↓ API Layer (Node.js/Express or Next.js API Routes)
├─ HubSpot API Client (Rate-limited, paginated)
├─ Data Aggregation & Normalization
└─ Claude API Integration (Inference)

↓ External Services
├─ HubSpot CRM API (Data Extraction)
└─ Anthropic Claude API (AI Analysis)
```

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS (production-optimized)
- **Backend:** Next.js API Routes (or Node.js/Express)
- **Package Manager:** npm
- **Build:** Vite or Next.js built-in
- **Deployment Ready:** Vercel or similar
- **Dev Environment:** Windows 11, VS Code

---

## Feature Set (MVP)

### 1. Audit Types (Phase 1)

Each audit is a "push-button" workflow:

#### **Contact Data Quality Audit**
- **Quantitative Metrics:**
  - Total contacts
  - Duplicate rate (email/phone matching)
  - Missing email % / Missing phone %
  - Hard bounce rate
  - Last contacted > X days (stale contacts)
  - Unassigned contacts %
  - Lifecycle stage distribution

- **Qualitative Analysis (Claude):**
  - Risk assessment relative to industry benchmarks
  - Root cause analysis of duplicates
  - Actionable remediation roadmap
  - ROI impact of data quality issues

#### **Deal Pipeline Health Audit**
- **Quantitative Metrics:**
  - Total deals by stage
  - Avg deal age by stage
  - Stuck deals (not moved in 30+ days)
  - Missing close date %
  - Missing amount %
  - Forecast accuracy (vs. actual close rates)

- **Qualitative Analysis:**
  - Pipeline bottleneck identification
  - Stage-specific issues
  - Sales process alignment
  - Forecast reliability

#### **Company Enrichment Audit**
- **Quantitative Metrics:**
  - Total companies
  - Missing industry %
  - Missing revenue %
  - Company-contact association coverage
  - Enrichment completeness score

- **Qualitative Analysis:**
  - Enrichment gaps vs. business type
  - Association quality issues
  - Data collection process recommendations

#### **Lead Scoring & Segmentation Audit**
- **Quantitative Metrics:**
  - Contacts by lifecycle stage
  - Lead score distribution
  - Velocity by stage (time-to-conversion)
  - Segment overlap/redundancy
  - Engagement rate by segment

- **Qualitative Analysis:**
  - Scoring model validity
  - Segment effectiveness
  - Recommendations for re-segmentation

#### **Sync Integrity Audit**
- **Quantitative Metrics:**
  - Active integrations
  - Recent sync errors
  - Failed record count by app
  - Property mapping coverage
  - Last successful sync timestamp

- **Qualitative Analysis:**
  - Integration health assessment
  - Risk of data drift
  - Remediation priority

---

## User Flow

```
1. User lands on app
2. Greeted with audit type selector (cards/buttons)
3. Clicks "Run Contact Data Quality Audit"
4. Loading state: "Fetching data from HubSpot..."
5. Results rendered:
   - LEFT SIDEBAR: Metric cards (duplicates: 247, bounce rate: 3.2%, etc.)
   - MAIN CONTENT: AI analysis narrative + recommendations
   - EXPORT: Download audit report (JSON/PDF)
6. Can switch to another audit type or re-run
```

---

## Data Flow

### Per Audit Request:

1. **Frontend** → Sends audit type + HubSpot account context
2. **Backend** → Receives request, initiates HubSpot API pull
   - Query contacts/deals/companies with filters
   - Apply pagination for large datasets
   - Aggregate metrics
3. **Backend** → Formats data + builds Claude prompt
   - Include: Raw metrics, industry context (user-provided or inferred), audit type
   - Example prompt: "I'm auditing a B2B SaaS CRM with 12k contacts. Duplicates: 247 (2%), bounce rate: 3.2%, unassigned: 8%. Analyze health and recommend fixes."
4. **Claude API** → Returns strategic analysis
5. **Backend** → Combines metrics + analysis
6. **Frontend** → Renders sidebar (metrics) + main content (analysis)

---

## Component Structure (React)

```
src/
├── components/
│   ├── AuditSelector.tsx          # Audit type buttons/cards
│   ├── AuditLayout.tsx            # Two-column layout (sidebar + main)
│   ├── MetricsSidebar.tsx         # Quantitative data display
│   │   ├── MetricCard.tsx
│   │   └── MetricGroup.tsx
│   ├── AnalysisPanel.tsx          # AI qualitative analysis
│   ├── LoadingState.tsx           # Skeleton/spinner
│   ├── ErrorBoundary.tsx
│   └── ExportButton.tsx           # Download report
├── pages/
│   ├── index.tsx                  # Home/audit selector
│   ├── audit/[type].tsx           # Dynamic audit page
│   └── api/
│       ├── hubspot/[endpoint].ts  # HubSpot API routes
│       └── claude/analyze.ts      # Claude inference route
├── hooks/
│   ├── useAudit.ts               # Audit logic
│   └── useHubSpot.ts             # HubSpot client
├── lib/
│   ├── hubspot-client.ts         # HubSpot API wrapper
│   ├── claude-client.ts          # Claude API wrapper
│   ├── audit-schemas.ts          # TypeScript types
│   └── prompts.ts                # Claude prompt templates
├── styles/
│   └── globals.css               # Tailwind
└── types/
    └── index.ts                  # Shared types
```

---

## API Endpoints (Backend)

### HubSpot Endpoints Consumed:
- `GET /crm/v3/objects/contacts` – Fetch contacts with properties
- `GET /crm/v3/objects/companies` – Fetch companies
- `GET /crm/v3/objects/deals` – Fetch deals
- `POST /crm/v3/objects/contacts/search` – Search with filters (duplicates, missing fields)
- `GET /crm/v3/objects/contacts/batch/read` – Batch fetch
- `GET /crm/v3/properties/contacts` – List properties
- (Similar for companies, deals, integrations)

### Internal API Routes:
- `POST /api/audit/contact-quality` → Triggers audit, returns metrics + analysis
- `POST /api/audit/pipeline-health` → Similar
- `POST /api/audit/enrichment` → Similar
- (One route per audit type, or one dynamic route)

---

## Key Technical Decisions

### Authentication
- **HubSpot:** User pastes private app access token (or OAuth flow later)
- **Claude:** Backend holds API key (env var), never exposed to frontend

### Rate Limiting & Performance
- Cache audit results for 1 hour (Redis or in-memory)
- Implement HubSpot rate limit backoff (10 req/sec max)
- Batch API calls where possible
- Stream Claude response if >5 seconds

### Data Normalization
- Convert HubSpot's Unix timestamps to ISO 8601
- Standardize property naming conventions
- Create reusable metric calculation functions (e.g., `calculateDuplicateRate()`)

### Error Handling
- Graceful degradation if API calls fail
- User-friendly error messages
- Retry logic with exponential backoff for transient failures

---

## Claude Prompt Template (Example)

```
You are a HubSpot CRM expert auditing a {{INDUSTRY}} company with {{COMPANY_SIZE}} contacts.

AUDIT TYPE: Contact Data Quality
ACCOUNT CONTEXT:
- Industry: {{INDUSTRY}}
- Company Type: {{COMPANY_TYPE}} (B2B, B2C, etc.)
- Estimated ARR: {{ARR}}
- Team Size: {{TEAM_SIZE}}

QUANTITATIVE METRICS:
- Total Contacts: {{TOTAL_CONTACTS}}
- Duplicates Detected: {{DUPLICATES}} ({{DUPLICATE_PCT}}%)
- Missing Email: {{MISSING_EMAIL_PCT}}%
- Missing Phone: {{MISSING_PHONE_PCT}}%
- Hard Bounce Rate: {{BOUNCE_RATE}}%
- Unassigned Contacts: {{UNASSIGNED}}%
- Lifecycle Stage Distribution: {{STAGE_DIST}}

Based on these metrics for a {{INDUSTRY}} {{COMPANY_TYPE}} business:
1. Assess data health: Is this good/concerning/critical?
2. Identify root causes for key issues
3. Quantify business impact (e.g., "This likely costs $X in wasted outreach")
4. Provide 3-5 actionable remediation steps prioritized by ROI
5. Benchmark against {{INDUSTRY}} averages

Respond in structured markdown with sections: Overview, Key Findings, Impact, Recommendations.
```

---

## Storage & State Management

- **Frontend State:** React `useState` + `useContext` for audit results
- **Optional:** Zustand or Jotai if complexity grows
- **Backend Cache:** In-memory Map or Redis (ttl: 1 hour)
- **Persistent:** User audit history (optional Phase 2) → Database

---

## Deployment

- **Frontend:** Vercel (Next.js) or Netlify
- **Backend:** Vercel serverless functions or separate Node.js server
- **Env Vars:** `HUBSPOT_API_KEY`, `CLAUDE_API_KEY`
- **CORS:** Configure for frontend origin

---

## Phase 1 MVP Scope

✅ **In Scope:**
- 1-2 audit types (Contact Data Quality + Deal Pipeline Health)
- Manual HubSpot token input
- Quantitative metrics display
- Claude analysis + sidebar layout
- Basic error handling

❌ **Out of Scope (Phase 2+):**
- OAuth flow for HubSpot
- Multi-user management / auth
- Audit history / trends
- Custom audit builder
- Report scheduling
- Zapier/Make integration

---

## Success Criteria

- [ ] User can select audit type and get results within 30 seconds
- [ ] Sidebar displays 8-12 key metrics clearly
- [ ] AI analysis is specific, actionable, and industry-aware
- [ ] No API errors bubble to user (graceful handling)
- [ ] Mobile responsive
- [ ] Can export audit report
- [ ] "Wow factor" — user feels like they got a real consulting insight

---

## Notes for Claude Code

- **Minimize dependencies:** Use React + Tailwind only, avoid heavy UI libs
- **Optimize bundle:** Tree-shake unused Tailwind utilities
- **Type everything:** Full TypeScript coverage for maintainability
- **Placeholder data:** Ship with mock audit data for demo/testing
- **Env config:** Support `.env.local` for local development
- **Start minimal:** Build Component → Styling → API integration in that order

---

## Repository Structure

```
hubspot-audit-app/
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js (or vite.config.ts)
├── README.md
├── src/
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── styles/
├── public/
│   └── favicon.ico
└── docs/
    └── API_REFERENCE.md
```

---

## Quick Start for Claude Code

```bash
# Initialize
npx create-next-app@latest hubspot-audit --ts --tailwind

# Or Vite
npm create vite@latest hubspot-audit -- --template react-ts

# Install dependencies
npm install

# Create .env.local with:
# HUBSPOT_API_KEY=your_token
# CLAUDE_API_KEY=your_key

# Start dev server
npm run dev

# Open http://localhost:3000
```

---

**Ready to build?** Hand this spec to Claude Code with: `claude code --spec ./HUBSPOT_AUDIT_SPEC.md`
