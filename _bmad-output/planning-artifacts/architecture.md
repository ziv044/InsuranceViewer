---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-03-17'
inputDocuments:
  - prd-insurance-viewer.md
  - ux-design-specification.md
  - market-israeli-insurtech-competitors-research-2026-03-13.md
  - israeli-pension-advisor/pension-fund-types.md
  - israeli-pension-advisor/tax-benefits.md
  - israeli-pension-advisor/SKILL.md
workflowType: 'architecture'
project_name: 'InsuranceViewer'
user_name: 'Ziv04'
date: '2026-03-17'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
- 7 screens: Landing/Upload, Unified Dashboard, Insurance Detail (INP), Savings Detail (KGM), Pension Detail (PNN), Har Habituach View, File Upload Status
- Client-side parsing of 4 file types: Mislaka XML (INP, KGM, PNN subtypes) + Har Habituach Excel
- Unified dashboard with KPI summary cards, drill-down navigation per product category
- Per-product detail views grouped by provider/employer with investment track breakdowns
- Sortable/filterable table for Har Habituach data
- Agent view: file upload + client management (minimal UX investment)
- User view: professional chart-rich dashboard (primary UX investment)

**Non-Functional Requirements:**
- **Privacy:** Zero server-side storage, no accounts, no credentials, browser-only processing
- **Performance:** Upload-to-dashboard render < 3 seconds
- **Language:** Hebrew-only, full RTL layout, Israeli date/currency/number formats
- **Accessibility:** WCAG 2.1 AA compliance, keyboard navigation, screen reader support
- **Responsive:** Mobile-first with full chart support (320px minimum), desktop-enhanced
- **Trust:** No recommendations, no commissions, pure visualization — trust messaging on every screen

**Scale & Complexity:**
- Primary domain: Client-side web application (Next.js)
- Complexity level: Medium
- Estimated architectural components: ~12 (parser engine, data model, 7 view components, chart system, jargon translator, state management)

### Technical Constraints & Dependencies

- **Next.js** — SSG for landing page, client-side rendering for app views
- **DOMParser** — browser-native XML parsing for Mislaka .DAT files
- **SheetJS (xlsx)** — client-side Excel parsing for Har Habituach
- **Recharts** — SVG chart library (~45KB), chosen for RTL control via `textAnchor`
- **Tailwind CSS + shadcn/ui** — design system with CSS variable theming, logical RTL properties
- **No backend for MVP** — static hosting only (Vercel/Netlify)
- **Browser compatibility** — modern browsers with DOMParser + FileReader API support

### Cross-Cutting Concerns Identified

1. **RTL/Hebrew** — Affects every component: layout direction, text alignment, chart axes, number formatting, Tailwind logical properties (`ps-`, `pe-`, `ms-`, `me-`)
2. **Client-side data flow** — Parsed data must flow from file input → parser → normalized model → multiple view components without persistence
3. **Privacy-by-design** — No data leaves the browser, no analytics on financial content, session-only memory
4. **Domain model complexity** — Israeli pension product taxonomy (4+ product types with distinct fee structures, contribution splits, tax treatments) must be accurately represented
5. **Data sharing (unresolved)** — How agent-parsed data reaches the end user's browser without server storage — this is the key architectural question to resolve
6. **Jargon translation** — 3-tier system (Replace / Simplify+Tooltip / Tooltip-only) applied consistently across all views, requires a translation dictionary as a first-class architectural component

## Starter Template Evaluation

### Primary Technology Domain

Client-side web application based on project requirements. No backend/API layer for MVP — static site with client-side processing.

### Starter Options Considered

| Option | Approach | Pros | Cons |
|--------|----------|------|------|
| `create-next-app` + `shadcn init` | Two-step, full control | Standard Next.js setup, well-documented, maximum flexibility | Two commands instead of one |
| shadcn/ui full template | Single scaffolding | One command | Less control over Next.js options, newer/less proven |
| Custom Vite + React | Manual setup | Lighter than Next.js | Lose SSG for landing, no `next/font`, more manual config |

### Selected Starter: create-next-app + shadcn init

**Rationale:** Standard, well-documented approach. `create-next-app` defaults in 2026 already include TypeScript, Tailwind, App Router, and Turbopack. Adding `shadcn init` on top gives us the component infrastructure with CSS variable theming. Two commands, zero surprises.

**Initialization Command:**

```bash
pnpm create next-app@latest insurance-viewer --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*"
cd insurance-viewer
npx shadcn@latest init
pnpm add recharts xlsx
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript (strict mode) with Next.js App Router
- Node.js runtime for build/SSG, browser runtime for app

**Styling Solution:**
- Tailwind CSS with PostCSS, configured via `tailwind.config.ts`
- shadcn/ui CSS variables for theming (`--primary`, `--secondary`, etc.)
- Logical RTL properties via Tailwind (`ps-`, `pe-`, `ms-`, `me-`)

**Build Tooling:**
- Turbopack for development (fast HMR)
- Next.js built-in production bundling with tree-shaking
- SSG for landing page, client-side rendering for dashboard

**Testing Framework:**
- Not included by default — to be decided in architectural decisions step

**Code Organization:**
- `src/` directory with App Router structure
- `src/app/` for pages and layouts
- `src/components/` for UI components (shadcn convention)
- `@/*` import alias for clean imports

**Development Experience:**
- Turbopack HMR for instant feedback
- ESLint for code quality
- TypeScript strict mode for type safety

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. State management approach — React Context + useReducer
2. Parser architecture — Strategy pattern, one parser per file type
3. Data model — Normalized TypeScript interfaces for all product types

**Important Decisions (Shape Architecture):**
4. Testing framework — Vitest
5. MVP scope — Agent-only (single user uploads and views)

**Deferred Decisions (Post-MVP):**
- Data sharing mechanism (agent → client browser transfer)
- Hosting/deployment platform
- User authentication / multi-user support
- Analytics and monitoring

### Data Architecture

**No Database — Browser Memory Only**
- All data lives in React state during the browser session
- Page refresh = data gone (by design, privacy feature)
- No localStorage, no IndexedDB, no cookies for financial data

**Data Model — Normalized TypeScript Interfaces:**

```typescript
// Core domain types derived from Mislaka XML + pension domain knowledge
interface ParsedPortfolio {
  metadata: FileMetadata[];
  products: FinancialProduct[];
  providers: Provider[];
  employers: Employer[];
}

interface FinancialProduct {
  id: string;
  type: 'insurance' | 'savings' | 'pension';  // INP | KGM | PNN
  subType: PensionSubType;  // keren-pensia | bituach-menahalim | keren-hishtalmut | kupat-gemel
  provider: Provider;
  employer?: Employer;
  policyNumber: string;
  status: ProductStatus;
  joinDate: string;
  // Type-specific data in discriminated union
  details: InsuranceDetails | SavingsDetails | PensionDetails;
}
```

- Discriminated unions for type-specific fields (insurance vs savings vs pension)
- All Hebrew field names mapped to English TypeScript properties
- Amounts stored as numbers, formatted with `Intl.NumberFormat('he-IL')` at display time

**Data Validation:**
- Zod schemas for runtime validation of parsed XML/Excel data
- Graceful handling of missing/malformed fields — show what we can, skip what we can't
- Validation errors surfaced per-file in the upload status view

### Authentication & Security

**No Authentication for MVP**
- No user accounts, no login, no session management
- Single-user model: agent opens app, uploads files, views dashboard
- Privacy through architecture: data never leaves the browser

**Security Measures:**
- Content Security Policy (CSP) headers — prevent XSS
- No external API calls from the app (all processing local)
- File input validation — verify file extensions and basic structure before parsing
- No `eval()` or dynamic code execution on parsed data

### API & Communication Patterns

**No API Layer**
- Zero network requests for data processing
- Static site served from any web server or opened locally
- All computation happens in the browser's main thread (or Web Workers if parsing is slow)

**Internal Module Communication:**
- File Input → Parser Engine → Context Provider → View Components
- Unidirectional data flow: parse once, read everywhere
- No pub/sub, no event bus — React's built-in re-render on context change is sufficient

### Frontend Architecture

**State Management: React Context + useReducer**
- Single `PortfolioContext` holds all parsed data
- `useReducer` for structured state transitions: `PARSE_START`, `PARSE_SUCCESS`, `PARSE_ERROR`
- Consumer hooks: `usePortfolio()`, `useProducts(type)`, `useKPIs()`
- State is set once (on file parse), then read-only — no complex mutations

**Parser Engine: Strategy Pattern**
- `src/lib/parsers/` directory with one module per file type
- `parseFile(file: File): Promise<ParseResult>` — detects type, delegates to correct parser
- Individual parsers: `parseINP.ts`, `parseKGM.ts`, `parsePNN.ts`, `parseHarBabituach.ts`
- Each parser: raw file → DOMParser/SheetJS → Zod validation → typed domain objects
- Parsers are pure functions — easy to unit test with sample files

**Component Architecture:**
- `src/components/ui/` — shadcn/ui base components
- `src/components/dashboard/` — custom dashboard components (KPI Fusion Card, Fee Comparison Bar, etc.)
- `src/components/agent/` — agent view components (upload zone, file status)
- `src/components/charts/` — Recharts wrapper components with RTL configuration

**Routing:**
- Next.js App Router file-based routing
- `/` — Landing page (SSG)
- `/dashboard` — Main dashboard view (client-side)
- `/dashboard/[section]` — Deep-link to specific section (optional, can be scroll-based)
- No dynamic server routes needed

**Performance:**
- Skeleton UI renders immediately, data fills in progressively
- Recharts lazy-loaded (`next/dynamic` with `ssr: false`) — charts are client-only
- SheetJS and XML parsing libraries loaded on-demand when files are dropped

### Infrastructure & Deployment

**Deferred for MVP**
- No hosting platform selected — runs locally via `pnpm dev`
- No CI/CD pipeline yet
- No monitoring or logging infrastructure
- Deployment decision made when ready to share with users

**Development Environment:**
- pnpm as package manager
- Turbopack for dev server
- ESLint for linting
- Vitest for unit/integration testing
- TypeScript strict mode

### Decision Impact Analysis

**Implementation Sequence:**
1. Project initialization (create-next-app + shadcn + dependencies)
2. RTL/Hebrew layout setup (root layout, fonts, direction)
3. Data model TypeScript interfaces + Zod schemas
4. Parser engine (strategy pattern + individual parsers)
5. Context provider + consumer hooks
6. Dashboard components (KPI cards, charts, tables)
7. Agent upload view

**Cross-Component Dependencies:**
- Parser output shape → Data model interfaces → Context provider → All view components
- RTL configuration → Every component's layout and styling
- Jargon translation dictionary → All text-displaying components
- Recharts RTL wrapper → All chart components

## Implementation Patterns & Consistency Rules

### Naming Patterns

**File Naming:**
- Components: `PascalCase.tsx` — `KPIFusionCard.tsx`, `FeeComparisonBar.tsx`
- Utilities/libs: `camelCase.ts` — `parseINP.ts`, `formatCurrency.ts`
- Types/interfaces: `camelCase.ts` — `portfolio.ts`, `parsers.ts`
- Test files: co-located `*.test.ts` — `parseINP.test.ts` next to `parseINP.ts`
- Constants: `camelCase.ts` — `jargonDictionary.ts`, `chartConfig.ts`

**Component Naming:**
- PascalCase for components: `KPIFusionCard`, `CoverageStatusRow`
- camelCase for hooks: `usePortfolio()`, `useProducts()`
- camelCase for utilities: `formatCurrency()`, `parseFile()`
- UPPER_SNAKE_CASE for reducer actions: `PARSE_START`, `PARSE_SUCCESS`, `PARSE_ERROR`, `RESET`

**Directory Naming:**
- kebab-case for all directories: `src/components/dashboard/`, `src/lib/parsers/`

### Structure Patterns

**Test Location: Co-located**
- Tests live next to source: `src/lib/parsers/parseINP.ts` + `src/lib/parsers/parseINP.test.ts`
- Test fixtures (sample XML/Excel files): `src/lib/parsers/__fixtures__/`
- No separate `__tests__/` directory

**Component Organization: By Feature**
```
src/
  app/                        # Next.js App Router pages
    layout.tsx                # Root layout (RTL, fonts, providers)
    page.tsx                  # Landing page (SSG)
    dashboard/
      page.tsx                # Dashboard view
  components/
    ui/                       # shadcn/ui base components
    dashboard/                # Dashboard-specific components
      KPIFusionCard.tsx
      FeeComparisonBar.tsx
      CoverageStatusRow.tsx
      ProductSummaryCard.tsx
      OrientationBar.tsx
    agent/                    # Agent view components
      FileUploadZone.tsx
    charts/                   # Recharts wrappers
      RTLBarChart.tsx
      RTLLineChart.tsx
  lib/
    parsers/                  # File parsing engine
      index.ts                # parseFile() dispatcher
      parseINP.ts
      parseKGM.ts
      parsePNN.ts
      parseHarBabituach.ts
    types/                    # TypeScript type definitions
      portfolio.ts
      parsers.ts
    context/                  # React Context providers
      PortfolioContext.tsx
    utils/                    # Shared utilities
      formatCurrency.ts
      formatDate.ts
      jargonDictionary.ts
```

### Data Format Patterns

**Number Formatting:**
- Store as `number`, format at display time only
- Currency: `Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' })`
- Percentages: `Intl.NumberFormat('he-IL', { style: 'percent', minimumFractionDigits: 2 })`
- Never format in parsers — raw numbers only

**Date Formatting:**
- Store as ISO string (`"2022-09-22"`)
- Display: `Intl.DateTimeFormat('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })`
- Never store as `Date` objects in state

**Hebrew String Management:**
- UI labels: centralized in `src/lib/strings/he.ts` — one object exported as `strings`
- Jargon translations: centralized in `src/lib/utils/jargonDictionary.ts`
- Never hardcode Hebrew strings in components — always import from strings file
- Exception: `aria-label` strings can be inline if they're component-specific

### Error Handling Patterns

**Parser Errors — Two Severity Levels:**

```typescript
type ParseResult = {
  status: 'success' | 'partial' | 'error';
  data?: FinancialProduct[];
  warnings: ParseWarning[];   // Missing fields, unexpected values
  error?: ParseError;          // File unreadable, wrong format
};
```

- `success` — all fields parsed, no issues
- `partial` — some fields missing or malformed, data is usable with gaps
- `error` — file completely unreadable, wrong format, corrupted

**Component Error Boundaries:**
- One error boundary wrapping the dashboard — catches rendering crashes
- Individual sections degrade gracefully: if one chart fails, others still render
- Never show a full-page error for partial failures

**Console Logging:**
- `console.warn()` for parser warnings (missing optional fields)
- `console.error()` for parser errors (unreadable files)
- No `console.log()` in production code — use only during development

### State Management Patterns

**Reducer Actions — Finite Set:**

```typescript
type PortfolioAction =
  | { type: 'PARSE_START' }
  | { type: 'PARSE_SUCCESS'; payload: ParsedPortfolio }
  | { type: 'PARSE_ERROR'; payload: ParseError }
  | { type: 'ADD_FILES'; payload: ParsedPortfolio }  // Merge additional files
  | { type: 'RESET' };
```

- All state updates go through the reducer — no direct `setState` on portfolio data
- State is immutable — spread existing state, never mutate
- Consumer hooks derive computed values (KPIs, totals) — don't store computed data in state

### Enforcement Guidelines

**All AI Agents MUST:**
1. Follow the file/directory naming conventions above — no exceptions
2. Import Hebrew strings from `strings/he.ts`, never hardcode
3. Use `Intl` formatters for numbers/dates, never manual string formatting
4. Return `ParseResult` from all parsers with proper status/warnings/error
5. Co-locate tests next to source files
6. Use the `@/*` import alias, never relative paths that go up more than one level

**Anti-Patterns to Avoid:**
- `formatNumber(n) { return n.toLocaleString() }` — use `Intl.NumberFormat` with explicit locale
- `<p>סה"כ נכסים</p>` — import from strings file instead
- `../../../lib/utils` — use `@/lib/utils` instead
- Storing formatted strings in state — store raw values, format in components
- Creating new Context providers without discussion — one `PortfolioContext` is sufficient

## Project Structure & Boundaries

### Complete Project Directory Structure

```
insurance-viewer/
├── README.md
├── package.json
├── pnpm-lock.yaml
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── components.json                  # shadcn/ui config
├── vitest.config.ts
├── .eslintrc.json
├── .gitignore
├── .env.example                     # Empty — no secrets needed
├── public/
│   └── fonts/                       # Self-hosted if not using next/font
├── src/
│   ├── app/
│   │   ├── globals.css              # Tailwind directives + CSS variables + RTL base
│   │   ├── layout.tsx               # Root: <html lang="he" dir="rtl">, fonts, PortfolioProvider
│   │   ├── page.tsx                 # Landing page (SSG) — trust messaging, upload CTA
│   │   └── dashboard/
│   │       └── page.tsx             # Dashboard view — 'use client', reads PortfolioContext
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components (auto-generated by CLI)
│   │   │   ├── accordion.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── skeleton.tsx
│   │   ├── dashboard/               # Custom dashboard components
│   │   │   ├── KPIFusionCard.tsx
│   │   │   ├── KPIFusionCard.test.tsx
│   │   │   ├── OrientationBar.tsx
│   │   │   ├── FeeComparisonBar.tsx
│   │   │   ├── CoverageStatusRow.tsx
│   │   │   ├── ProductSummaryCard.tsx
│   │   │   ├── DashboardSkeleton.tsx
│   │   │   └── EmptyStateCard.tsx
│   │   ├── agent/                   # Agent view components
│   │   │   ├── FileUploadZone.tsx
│   │   │   ├── FileUploadZone.test.tsx
│   │   │   ├── FileStatusList.tsx
│   │   │   └── AgentFooter.tsx
│   │   ├── charts/                  # Recharts RTL wrappers
│   │   │   ├── RTLBarChart.tsx
│   │   │   ├── RTLLineChart.tsx
│   │   │   ├── RTLPieChart.tsx
│   │   │   └── chartConfig.ts       # Shared chart theme, colors, RTL defaults
│   │   └── layout/                  # Shared layout components
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── ViewToggle.tsx        # Agent/User view toggle (dev only)
│   ├── lib/
│   │   ├── parsers/                 # File parsing engine
│   │   │   ├── index.ts             # parseFile() — detects type, delegates
│   │   │   ├── parseINP.ts          # Insurance XML parser
│   │   │   ├── parseINP.test.ts
│   │   │   ├── parseKGM.ts          # Savings/Gemel XML parser
│   │   │   ├── parseKGM.test.ts
│   │   │   ├── parsePNN.ts          # Pension XML parser
│   │   │   ├── parsePNN.test.ts
│   │   │   ├── parseHarBabituach.ts # Excel parser
│   │   │   ├── parseHarBabituach.test.ts
│   │   │   ├── xmlUtils.ts          # Shared XML helpers (extractText, extractNumber)
│   │   │   └── __fixtures__/        # Sample test files
│   │   │       ├── sample-INP.dat
│   │   │       ├── sample-KGM.dat
│   │   │       ├── sample-PNN.dat
│   │   │       └── sample-har-habituach.xlsx
│   │   ├── types/                   # TypeScript type definitions
│   │   │   ├── portfolio.ts         # ParsedPortfolio, FinancialProduct, etc.
│   │   │   ├── parsers.ts           # ParseResult, ParseWarning, ParseError
│   │   │   └── ui.ts                # Component prop types if shared
│   │   ├── schemas/                 # Zod validation schemas
│   │   │   ├── insuranceSchema.ts
│   │   │   ├── savingsSchema.ts
│   │   │   ├── pensionSchema.ts
│   │   │   └── harBabituachSchema.ts
│   │   ├── context/                 # React Context providers
│   │   │   ├── PortfolioContext.tsx  # Provider + reducer + consumer hooks
│   │   │   └── PortfolioContext.test.tsx
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── usePortfolio.ts      # Re-exported from context for convenience
│   │   │   ├── useProducts.ts       # Filter products by type
│   │   │   └── useKPIs.ts           # Compute KPI values from portfolio
│   │   ├── strings/                 # Hebrew UI strings
│   │   │   └── he.ts               # All Hebrew labels, messages, tooltips
│   │   └── utils/                   # Shared utilities
│   │       ├── formatCurrency.ts
│   │       ├── formatDate.ts
│   │       ├── formatPercent.ts
│   │       └── jargonDictionary.ts  # 3-tier jargon translation mappings
│   └── styles/                      # Additional style tokens if needed
│       └── tokens.css               # Custom CSS variables beyond shadcn defaults
```

### Architectural Boundaries

**Component Boundaries:**

```
┌─────────────────────────────────────────────┐
│  App Shell (layout.tsx)                     │
│  ├── PortfolioProvider (wraps all routes)   │
│  ├── Header + ViewToggle                    │
│  │                                          │
│  ├── Landing Page (/)                       │
│  │   └── Static content (SSG)              │
│  │                                          │
│  └── Dashboard (/dashboard)   'use client'  │
│      ├── AgentView (if agent mode)          │
│      │   ├── FileUploadZone                 │
│      │   └── FileStatusList                 │
│      │                                      │
│      └── UserView (if user mode)            │
│          ├── OrientationBar                 │
│          ├── KPIFusionCard × 3              │
│          ├── Charts (RTL wrappers)          │
│          ├── CoverageStatusRow (table)      │
│          └── Accordion > ProductSummaryCard │
└─────────────────────────────────────────────┘
```

**Data Flow Boundary:**

```
Files (.DAT/.xlsx)
    ↓ FileReader API
Parser Engine (src/lib/parsers/)
    ↓ ParseResult
Zod Validation (src/lib/schemas/)
    ↓ Typed domain objects
PortfolioContext (src/lib/context/)
    ↓ React Context
Consumer Hooks (src/lib/hooks/)
    ↓ Derived data
View Components (src/components/)
    ↓ Formatted display
Intl Formatters (src/lib/utils/)
```

**Boundary Rules:**
- Parsers never import from components — they return pure data
- Components never call parsers directly — they read from context
- Context never formats data — it stores raw values
- Utils are pure functions — no side effects, no state access
- Charts never access context directly — they receive props from parent dashboard components

### Requirements to Structure Mapping

| PRD Screen | Route | Key Components | Data Source |
|-----------|-------|----------------|-------------|
| Landing/Upload | `/` (SSG) | Landing page content, trust messaging | Static |
| Unified Dashboard | `/dashboard` | OrientationBar, KPIFusionCard ×3, Charts | `useKPIs()`, `useProducts()` |
| Insurance Detail (INP) | Dashboard section | CoverageStatusRow, ProductSummaryCard | `useProducts('insurance')` |
| Savings Detail (KGM) | Dashboard section | FeeComparisonBar, ProductSummaryCard | `useProducts('savings')` |
| Pension Detail (PNN) | Dashboard section | Charts, ProductSummaryCard | `useProducts('pension')` |
| Har Habituach View | Dashboard section | Table component | `useProducts()` filtered |
| File Upload Status | Agent view | FileUploadZone, FileStatusList | `usePortfolio().metadata` |

### Cross-Cutting Concerns Mapping

| Concern | Files Affected | Implementation |
|---------|---------------|----------------|
| RTL/Hebrew | `layout.tsx`, `globals.css`, all components | `dir="rtl"`, `lang="he"`, Tailwind logical properties |
| Jargon Translation | `jargonDictionary.ts`, all text-displaying components | Import dictionary, apply tier per term |
| Number Formatting | `formatCurrency.ts`, `formatPercent.ts`, `formatDate.ts` | `Intl` formatters with `he-IL` locale |
| Skeleton Loading | `DashboardSkeleton.tsx`, all dashboard components | `animate-pulse` matching component layout |
| Error Handling | All parsers → `ParseResult`, `EmptyStateCard.tsx` | Graceful degradation per section |

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility: PASS**
- Next.js App Router + TypeScript + Tailwind + shadcn/ui — all first-party compatible
- Recharts client-side only — aligned with `next/dynamic` lazy loading
- SheetJS browser-compatible — aligned with client-side parsing
- Zod + TypeScript — aligned with type-safe validation
- Vitest + TypeScript/Next.js — no conflicts
- React Context + useReducer — built into React, zero dependencies

**Pattern Consistency: PASS**
- Naming conventions consistent with React/Next.js ecosystem norms
- Co-located tests supported by Vitest configuration
- `@/*` imports configured by create-next-app
- Hebrew strings centralization compatible with component architecture

**Structure Alignment: PASS**
- App Router routing aligns with two-page structure (landing + dashboard)
- Component organization by feature aligns with PRD screen definitions
- Parser strategy pattern aligns with 4 distinct file types
- Context provider at layout level aligns with dashboard data access needs

### Requirements Coverage Validation

**Functional Requirements: ALL COVERED**

| PRD Requirement | Architectural Support |
|----------------|----------------------|
| File upload (DAT + xlsx) | FileUploadZone → parseFile() dispatcher |
| Client-side parsing | DOMParser (XML) + SheetJS (Excel) in parsers/ |
| Unified dashboard | /dashboard route + PortfolioContext + useKPIs() |
| Insurance detail (INP) | parseINP.ts → useProducts('insurance') → dashboard section |
| Savings detail (KGM) | parseKGM.ts → useProducts('savings') → dashboard section |
| Pension detail (PNN) | parsePNN.ts → useProducts('pension') → dashboard section |
| Har Habituach view | parseHarBabituach.ts → table component |
| File upload status | ParseResult.status/warnings → FileStatusList |

**Non-Functional Requirements: ALL COVERED**

| NFR | Architectural Support |
|-----|----------------------|
| Privacy (zero storage) | Browser memory only, no localStorage/IndexedDB/cookies |
| Performance (<3s) | Progressive rendering, lazy-loaded charts, skeleton UI |
| Hebrew RTL | `dir="rtl"`, `lang="he"`, Tailwind logical properties, `Intl` formatters |
| WCAG AA | Semantic HTML, ARIA labels, keyboard nav, focus indicators |
| Mobile-first | Tailwind responsive breakpoints, ResponsiveContainer charts |
| Trust | No external API calls, static site, trust messaging on landing |

### Implementation Readiness Validation

**Decision Completeness: PASS**
- All critical decisions documented with rationale
- Technology versions verifiable via latest npm packages
- No ambiguous "TBD" items in critical path

**Structure Completeness: PASS**
- Every file in project tree has a clear purpose
- No placeholder directories — all populated with specific files
- Integration points (parser → context → components) clearly defined

**Pattern Completeness: PASS**
- Naming, structure, data format, error handling, and state patterns all defined
- Anti-patterns documented with correct alternatives
- Enforcement guidelines are actionable

### Gap Analysis Results

**No Critical Gaps Found**

**Minor Gaps (non-blocking, resolved during implementation):**
1. Har Habituach Excel column mapping — resolved dynamically via header row detection
2. SUG-MUTZAR code table — built incrementally as sample files are tested
3. Jargon dictionary content — architecture defines system and location, terms populated during implementation

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented
- [x] Technology stack fully specified
- [x] Data model defined with TypeScript interfaces
- [x] State management approach chosen
- [x] Parser architecture defined
- [x] Performance strategy documented

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Data format patterns specified
- [x] Error handling patterns documented
- [x] State management patterns defined
- [x] Anti-patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Data flow boundaries mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status: READY FOR IMPLEMENTATION**

**Confidence Level:** High — well-scoped, medium-complexity project with clear boundaries and no unresolved architectural tensions in MVP scope.

**Key Strengths:**
- Zero-backend architecture eliminates entire categories of complexity
- Strategy pattern for parsers makes core engine testable and extensible
- Clear data flow boundary prevents spaghetti architecture
- UX spec and architecture are fully aligned

**Areas for Future Enhancement (Post-MVP):**
- Data sharing mechanism for agent → client handoff
- Web Workers for parsing large files without blocking UI
- Hosting/deployment platform selection
- E2E testing with Playwright
