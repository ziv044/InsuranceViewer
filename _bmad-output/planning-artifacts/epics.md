---
stepsCompleted: [1, 2, 3, 4]
status: complete
completedAt: '2026-03-17'
inputDocuments:
  - prd-insurance-viewer.md
  - architecture.md
  - ux-design-specification.md
---

# InsuranceViewer - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for InsuranceViewer, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Landing page with app name, Hebrew tagline, trust messaging, and drag-and-drop file upload zone accepting .DAT and .xlsx files
FR2: Auto-detect uploaded file type (INP/KGM/PNN XML subtypes from .DAT, Excel from .xlsx)
FR3: Client-side XML parsing of Mislaka .DAT files using DOMParser — extract INP (insurance), KGM (savings), PNN (pension) product data
FR4: Client-side Excel parsing of Har Habituach .xlsx files using SheetJS
FR5: Unified Dashboard with summary KPI cards: total savings, projected monthly pension, coverage snapshot, number of providers, number of employers
FR6: Insurance Products Detail view (INP) — cards/table grouped by provider showing policy number, status, join date, contribution rate, monthly deposit, deposit history
FR7: Savings Funds Detail view (KGM) — cards grouped by fund with investment track breakdown showing track name, balance, net return, management fees
FR8: Pension Detail view (PNN) — cards grouped by employer showing provider, pension type (old/new), insurance track, retirement projections table with projected monthly pension, total at retirement, return rate
FR9: Har Habituach view — data table from Excel with sortable columns, search/filter, clean Hebrew rendering
FR10: File Upload Status view — per-file: file name, type recognized, records found, provider names, parsing status (success/error/partial)
FR11: Navigation between dashboard sections via click-through cards and tab/section navigation (ביטוח | קופות גמל | פנסיה | הר הביטוח)
FR12: KPI Fusion Cards — Big Three KPIs (total savings, monthly pension, coverage snapshot) displayed as number + plain-Hebrew sentence
FR13: Orientation Bar — data inventory confirmation showing product count, provider count, employer count
FR14: Fee Comparison — horizontal bar chart comparing management fees across all products, showing both percentage and annual NIS cost
FR15: Coverage Status — table showing coverage type, amount, provider, and status badge (active/missing/expired)
FR16: Action Items cards — annual fees total in NIS/year, withdrawal eligibility summary
FR17: Drill-down via accordion — "see details" links expand inline to show full data tables, product-level detail, all pension projection scenarios
FR18: 3-tier jargon translation system — Tier 1 (replace entirely), Tier 2 (simplify + tooltip), Tier 3 (tooltip only) applied consistently across all views
FR19: Agent view — file upload zone (drag-and-drop), file status list with parse results, "view as user" button
FR20: View toggle between agent view and user dashboard view (dev/testing only, via URL parameter or top-bar toggle)
FR21: Progressive rendering — skeleton UI first, KPI numbers appear first, charts render after
FR22: Multiple file support — user can upload multiple .DAT files from different providers, data merges into unified portfolio
FR23: Donut chart for savings track allocation with center total NIS overlay
FR24: Sparklines for deposit history trends inline within product cards
FR25: Data freshness display — "נתונים מתאריך [date]" visible in nav bar

### NonFunctional Requirements

NFR1: Zero server-side data storage — all parsing happens client-side in the browser
NFR2: No user accounts, no authentication, no credentials — no sign-up required
NFR3: Data lives only in browser memory during session — page refresh/close = data gone
NFR4: No analytics on financial data content
NFR5: Trust messaging prominent on every screen — "המידע שלך לא נשמר, לא נשלח לשום מקום"
NFR6: Hebrew-only UI — all text, labels, headings in Hebrew
NFR7: Full RTL layout throughout — dir="rtl", lang="he", Tailwind logical properties
NFR8: Israeli date format (DD/MM/YYYY), NIS currency (₪), Israeli number conventions via Intl formatters
NFR9: Upload-to-dashboard render under 3 seconds
NFR10: WCAG 2.1 AA accessibility compliance — keyboard navigation, screen reader support, focus indicators, 4.5:1 contrast ratios
NFR11: Mobile-first responsive design — full chart support at 320px minimum width
NFR12: Professional, trustworthy aesthetic — no recommendation CTAs, no commission-driven bias, no playful design
NFR13: Content Security Policy (CSP) headers to prevent XSS
NFR14: File input validation — verify file extensions and basic structure before parsing
NFR15: No eval() or dynamic code execution on parsed data
NFR16: Minimum 44x44px touch targets for all interactive elements
NFR17: prefers-reduced-motion support — disable skeleton pulse animation
NFR18: prefers-contrast support — increase border opacity for status indicators

### Additional Requirements

AR1: Project initialization using create-next-app + shadcn init + recharts + xlsx dependencies (starter template from Architecture)
AR2: TypeScript strict mode with Next.js App Router
AR3: React Context + useReducer for state management — single PortfolioContext with PARSE_START, PARSE_SUCCESS, PARSE_ERROR, ADD_FILES, RESET actions
AR4: Strategy pattern parser architecture — parseFile() dispatcher + individual parsers (parseINP, parseKGM, parsePNN, parseHarBabituach)
AR5: Zod schemas for runtime validation of parsed XML/Excel data — graceful handling of missing/malformed fields
AR6: Normalized TypeScript data model — ParsedPortfolio, FinancialProduct (discriminated unions for insurance/savings/pension), Provider, Employer interfaces
AR7: Consumer hooks — usePortfolio(), useProducts(type), useKPIs() deriving computed values from context
AR8: Vitest for unit/integration testing with co-located test files
AR9: Centralized Hebrew strings in src/lib/strings/he.ts — never hardcode Hebrew in components
AR10: Jargon dictionary as first-class architectural component in src/lib/utils/jargonDictionary.ts
AR11: Recharts lazy-loaded with next/dynamic (ssr: false) — charts are client-only
AR12: RTL chart configuration — SVG textAnchor manipulation, Intl.NumberFormat('he-IL') throughout
AR13: Error boundary wrapping the dashboard — individual sections degrade gracefully
AR14: Shared XML helpers (extractText, extractNumber) in xmlUtils.ts
AR15: Test fixtures — sample XML/Excel files in __fixtures__/ directory
AR16: @/* import alias — never relative paths more than one level up

### UX Design Requirements

UX-DR1: Implement KPI Fusion Card component — large number (36px bold) + plain-Hebrew sentence (16px body) + optional "see details" link + semantic card tint (healthy/attention/neutral). Props: value, sentence, status, detailsLink. States: default, healthy (green tint), attention (amber border), loading (skeleton)
UX-DR2: Implement Orientation Bar component — inline text with bold counts on muted background strip. Props: products, providers, employers, fileTypes. States: loaded (counts), partial (available + missing). Accessibility: role="status", aria-live="polite"
UX-DR3: Implement Fee Comparison Bar component — horizontal bar chart row with product name, bar fill, fee % and annual NIS cost overlay. Built with Recharts BarChart + custom label renderer. States: default (navy/teal fill), attention (amber for above-average)
UX-DR4: Implement Coverage Status Row component — 4-column table row with Badge for status (active/missing/expired). Coverage type, amount, provider, status
UX-DR5: Implement Product Summary Card component — compact card for drill-down: product name, provider, 3-stat grid (balance, return, status), optional badge. States: default, with withdrawal badge, loading skeleton
UX-DR6: Implement Agent File Upload Zone component — dashed border drag-and-drop area, instruction text in Hebrew, file list with status badges (✓/✗). States: empty, hover highlight, files uploaded
UX-DR7: Implement Agent Footer component — centered "talk to your agent" hint + data disclaimer. Static, no interactivity
UX-DR8: Implement Direction D "Story Dense" single-page layout — nav bar, orientation bar, 3-column KPI row, side-by-side chart pairs (savings + fees, coverage + pension), agent footer. No tabs, no chapters
UX-DR9: Implement design token system — CSS variables for navy (#1e3a5f), teal (#0d9488), background (#fafafa), card (#ffffff), semantic status colors (healthy, attention, missing, info) at 5% opacity backgrounds and 10% opacity borders
UX-DR10: Implement typography system — Assistant font for headings (600/700 weight), Heebo for body/numbers (400/500/700), font-variant-numeric: tabular-nums for aligned columns, type scale from 12px caption to 36px KPI
UX-DR11: Implement semantic color coding on cards — subtle bg tinting (emerald-500/5 healthy, amber-500/10 attention border), never on text, only where status adds information value
UX-DR12: Implement skeleton loading states for all components — card-shaped and chart-shaped variants matching Direction D layout. Pattern: bg-slate-200 animate-pulse rounded. Progressive reveal: nav → KPI numbers → KPI sentences → charts → tables
UX-DR13: Implement empty state cards — muted card with centered text, outline icon, "אין מידע זמין בנושא זה" in text-slate-400. Pattern: bg-slate-50 border-dashed border-slate-200 rounded-lg p-8 text-center
UX-DR14: Implement tooltip system for jargon translation — dotted underline trigger (border-b border-dotted border-slate-400 cursor-help), dark tooltip (bg-slate-800 text-white max-w-280px), 200ms open delay, tap-to-toggle on mobile
UX-DR15: Implement badge system for status indicators — active (emerald), missing (amber), expired (slate), withdrawal eligible (teal). Size: text-xs px-2 py-0.5 rounded-full font-medium
UX-DR16: Implement warm micro-copy patterns — first-person possessive Hebrew ("יש לך", "שלך"), warm empty states, warm error messages per UX spec patterns
UX-DR17: Implement responsive layout — mobile single-column (320px+), tablet two-column KPIs (768px+), desktop full Story Dense layout (1024px+). Charts: ResponsiveContainer width="100%" height minimum 240px mobile / 320px desktop
UX-DR18: Implement keyboard navigation — Tab through all interactive elements, Enter/Space for accordion, arrow keys between accordion items, focus on tooltips, skip link "דלג לתוכן הראשי"
UX-DR19: Implement screen reader support — semantic HTML (main, nav, section, article), aria-labels on KPI numbers with Hebrew description, role="img" on charts with text summary, aria-busy on loading skeletons
UX-DR20: Implement error states — per-file errors in agent view (red badge + message + retry), partial parse errors in user view (empty state card per section + footnote), no-files-loaded full-page message

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | Landing page with upload zone |
| FR2 | Epic 1 | Auto-detect file types |
| FR3 | Epic 1 | XML parsing (INP/KGM/PNN) |
| FR4 | Epic 1 | Excel parsing (Har Habituach) |
| FR5 | Epic 2 | Dashboard summary KPI cards |
| FR6 | Epic 3 | Insurance detail view |
| FR7 | Epic 3 | Savings detail view |
| FR8 | Epic 3 | Pension detail view |
| FR9 | Epic 3 | Har Habituach table view |
| FR10 | Epic 1 | File upload status view |
| FR11 | Epic 3 | Section navigation |
| FR12 | Epic 2 | KPI Fusion Cards |
| FR13 | Epic 2 | Orientation Bar |
| FR14 | Epic 4 | Fee comparison chart |
| FR15 | Epic 4 | Coverage status table |
| FR16 | Epic 2 | Action items cards |
| FR17 | Epic 3 | Accordion drill-down |
| FR18 | Epic 3 | 3-tier jargon translation |
| FR19 | Epic 5 | Agent view |
| FR20 | Epic 5 | View toggle |
| FR21 | Epic 2 | Progressive rendering |
| FR22 | Epic 1 | Multiple file support |
| FR23 | Epic 4 | Donut chart (savings allocation) |
| FR24 | Epic 4 | Sparklines (deposit history) |
| FR25 | Epic 2 | Data freshness display |

## Epic List

### Epic 1: Project Foundation & File Parsing
User can upload Mislaka (.DAT) and Har Habituach (.xlsx) files and see them parsed successfully with file status feedback.
**FRs covered:** FR1, FR2, FR3, FR4, FR10, FR22
**ARs covered:** AR1-AR8, AR9, AR13-AR16
**NFRs addressed:** NFR1-NFR5 (privacy), NFR6-NFR8 (Hebrew/RTL foundation), NFR13-NFR15 (security)

### Epic 2: Financial Overview Dashboard
User opens the dashboard and instantly sees their complete financial picture — KPI totals, orientation bar, action items — on the Story Dense single-page layout with skeleton loading.
**FRs covered:** FR5, FR12, FR13, FR16, FR21, FR25
**UX-DRs covered:** UX-DR1, UX-DR2, UX-DR8, UX-DR9, UX-DR10, UX-DR12, UX-DR13, UX-DR16

### Epic 3: Detailed Views, Drill-Down & Jargon Translation
User can explore every financial product in detail — insurance, savings, pension, Har Habituach — with accordion drill-downs, navigation, and all jargon translated inline.
**FRs covered:** FR6, FR7, FR8, FR9, FR11, FR17, FR18
**ARs covered:** AR10
**UX-DRs covered:** UX-DR4, UX-DR5, UX-DR14, UX-DR15, UX-DR17, UX-DR18, UX-DR19, UX-DR20

### Epic 4: Charts & Visual Analysis
User sees visual breakdowns — savings allocation donut chart, fee comparison bars with NIS/year, coverage status table with badges, deposit sparklines, semantic color coding on cards.
**FRs covered:** FR14, FR15, FR23, FR24
**ARs covered:** AR11, AR12
**UX-DRs covered:** UX-DR3, UX-DR11

### Epic 5: Agent View
Insurance agent can upload client files via drag-and-drop, see per-file parse status, and preview the user dashboard via "view as user" button.
**FRs covered:** FR19, FR20
**UX-DRs covered:** UX-DR6, UX-DR7

---

## Epic 1: Project Foundation & File Parsing

User can upload Mislaka (.DAT) and Har Habituach (.xlsx) files and see them parsed successfully with file status feedback.

### Story 1.1: Initialize Next.js Project with Design System Foundation

As a developer,
I want a properly configured Next.js project with TypeScript, Tailwind, shadcn/ui, and all dependencies,
So that I have a solid foundation to build all features on.

**Acceptance Criteria:**

**Given** a fresh project directory
**When** the initialization commands are run
**Then** a Next.js App Router project exists with TypeScript strict mode enabled
**And** Tailwind CSS is configured with RTL support (dir="rtl", lang="he" on html element)
**And** shadcn/ui is initialized with the InsuranceViewer design tokens (navy #1e3a5f primary, teal #0d9488 secondary, background #fafafa)
**And** Assistant and Heebo Google Fonts are configured in the Next.js font system
**And** recharts and xlsx (SheetJS) packages are installed
**And** Vitest is configured with co-located test file support
**And** the @/* import alias is configured in tsconfig.json
**And** CSP headers are configured in next.config to prevent XSS
**And** the project builds and runs without errors

### Story 1.2: Create Data Model, Zod Schemas & State Management

As a developer,
I want the TypeScript data model, Zod validation schemas, and React Context state management in place,
So that parsed file data can be stored and consumed consistently across all components.

**Acceptance Criteria:**

**Given** the initialized project from Story 1.1
**When** the data model module is implemented
**Then** TypeScript interfaces exist for ParsedPortfolio, FinancialProduct (with discriminated unions for insurance/savings/pension subtypes), Provider, Employer, and FileMetadata
**And** Zod schemas exist that validate parsed data and handle missing/malformed fields gracefully (returning warnings, not throwing)
**And** a PortfolioContext with useReducer is implemented supporting PARSE_START, PARSE_SUCCESS, PARSE_ERROR, ADD_FILES, and RESET actions
**And** consumer hooks usePortfolio(), useProducts(type), and useKPIs() are implemented that derive computed values from context
**And** the centralized Hebrew strings file exists at src/lib/strings/he.ts
**And** all interfaces, schemas, and hooks have co-located unit tests passing

### Story 1.3: Build Landing Page with File Upload

As a user,
I want a Hebrew landing page where I can drag-and-drop or select my Mislaka and Har Habituach files,
So that I can start viewing my financial data.

**Acceptance Criteria:**

**Given** the user opens the application root URL
**When** the landing page loads
**Then** the app name and Hebrew tagline are displayed ("העלה. ראה. הבן.")
**And** trust messaging is prominently displayed: "המידע שלך לא נשמר, לא נשלח לשום מקום. הכל קורה בדפדפן שלך."
**And** a drag-and-drop upload zone is visible accepting .DAT and .xlsx files
**And** file type indicators show which formats are accepted (מסלקה .DAT and הר הביטוח .xlsx)
**And** a brief guide link exists: "איך להוריד את הקבצים?"
**And** no login, sign-up, or registration UI exists
**And** the layout is fully RTL with Hebrew text
**And** the page is responsive — single column on mobile, centered content on desktop
**And** file input validation rejects non-.DAT and non-.xlsx files with a Hebrew error message

### Story 1.4: Implement XML Parser for INP Insurance Products

As a user,
I want my Mislaka insurance (.DAT) file parsed correctly,
So that my insurance product data appears in the application.

**Acceptance Criteria:**

**Given** a .DAT file with SUG-MUTZAR code 6 (INP insurance products)
**When** the file is uploaded and the parseINP parser processes it
**Then** the parser extracts all Mutzar elements from the XML using DOMParser
**And** each product includes: policy number (MISPAR-POLISA-O-HESHBON), join date (TAARICH-HITZTARFUT-MUTZAR), status (STATUS-POLISA-O-CHESHBON), contribution rate (ACHUZ-HAFRASHA), monthly deposit amounts (SCHUM-HAFKADA-SHESHULAM), last deposit date (TAARICH-HAFKADA-ACHARON), deposit history
**And** provider info is extracted from YeshutYatzran (SHEM-YATZRAN)
**And** the parsed data is validated against Zod schemas
**And** malformed or missing fields produce warnings (not errors) in the ParseResult
**And** the parseFile() strategy dispatcher correctly routes .DAT files with SUG-MUTZAR 6 to parseINP
**And** shared XML helpers (extractText, extractNumber) are used from xmlUtils.ts
**And** test fixtures with sample INP XML exist and parser tests pass

### Story 1.5: Implement XML Parser for KGM Savings Funds

As a user,
I want my Mislaka savings fund (.DAT) file parsed correctly,
So that my savings and education fund data appears in the application.

**Acceptance Criteria:**

**Given** a .DAT file with SUG-MUTZAR code 4 (KGM savings/education funds)
**When** the file is uploaded and the parseKGM parser processes it
**Then** the parser extracts all Mutzar elements including investment track breakdowns
**And** each fund includes: account number, employer name/address, contribution split (employee/employer percentages)
**And** each investment track includes: track name (SHEM-MASLUL-HASHKAA), balance (SCHUM-TZVIRA-BAMASLUL), net return (TSUA-NETO), deposit management fee (SHEUR-DMEI-NIHUL-HAFKADA), savings management fee (SHEUR-DMEI-NIHUL-HISACHON)
**And** data is validated against Zod schemas with graceful handling of missing fields
**And** the parseFile() dispatcher correctly routes .DAT files with SUG-MUTZAR 4 to parseKGM
**And** test fixtures with sample KGM XML exist and parser tests pass

### Story 1.6: Implement XML Parser for PNN Pension Data

As a user,
I want my Mislaka pension (.DAT) file parsed correctly,
So that my pension fund details and retirement projections appear in the application.

**Acceptance Criteria:**

**Given** a .DAT file with SUG-MUTZAR code 2 (PNN pension)
**When** the file is uploaded and the parsePNN parser processes it
**Then** the parser extracts pension fund details: provider, pension type old/new (PENSIA-VATIKA-O-HADASHA), insurance track (SHEM-MASLUL-HABITUAH), employer name/address
**And** all retirement projection scenarios are extracted: projected monthly pension (SCHUM-KITZVAT-ZIKNA), total at retirement (TOTAL-SCHUM-MTZBR-TZAFUY...), projected return rate (ACHUZ-TSUA-BATACHAZIT)
**And** data is validated against Zod schemas with graceful handling of missing fields
**And** the parseFile() dispatcher correctly routes .DAT files with SUG-MUTZAR 2 to parsePNN
**And** test fixtures with sample PNN XML exist and parser tests pass

### Story 1.7: Implement Excel Parser for Har Habituach

As a user,
I want my Har Habituach Excel (.xlsx) file parsed correctly,
So that my Insurance Mountain data appears in the application.

**Acceptance Criteria:**

**Given** a .xlsx file from the Har Habituach government portal
**When** the file is uploaded and the parseHarBabituach parser processes it using SheetJS
**Then** all rows and columns from the Excel file are extracted into structured data
**And** Hebrew column headers are preserved and mapped to data fields
**And** data is validated against Zod schemas
**And** the parseFile() dispatcher correctly identifies .xlsx files and routes to parseHarBabituach
**And** test fixtures with sample Excel data exist and parser tests pass

### Story 1.8: Build File Upload Status View and Multi-File Support

As a user,
I want to see which files I uploaded, what was detected in each, and whether parsing succeeded,
So that I have confidence my data was processed correctly.

**Acceptance Criteria:**

**Given** the user has uploaded one or more files
**When** parsing completes (success, error, or partial)
**Then** a file status view shows per-file: file name, recognized type (INP/KGM/PNN/HarBabituach), number of products/records found, provider names detected, parsing status (success/error/partial)
**And** successful files show a green checkmark badge
**And** failed files show a red error badge with specific error message in Hebrew and "try again" option
**And** partial parses show an amber badge with count of successful vs total records
**And** uploading multiple .DAT files from different providers merges data into the unified ParsedPortfolio via the ADD_FILES reducer action
**And** the RESET action clears all data and returns to the upload state
**And** data is stored only in browser memory — no localStorage, no server calls

---

## Epic 2: Financial Overview Dashboard

User opens the dashboard and instantly sees their complete financial picture — KPI totals, orientation bar, action items — on the Story Dense single-page layout with skeleton loading.

### Story 2.1: Build Story Dense Layout Shell with Navigation

As a user,
I want a professional, single-page dashboard layout that loads instantly with skeleton placeholders,
So that I feel confident the tool is working before data even appears.

**Acceptance Criteria:**

**Given** parsed data exists in PortfolioContext
**When** the user navigates to the dashboard view
**Then** the Story Dense single-page layout renders: nav bar at top, content area below with max-width 1280px centered
**And** the nav bar shows the InsuranceViewer app name and data freshness date ("נתונים מתאריך DD/MM/YYYY")
**And** trust messaging appears in the nav or sub-nav area
**And** skeleton UI loads instantly — gray pulsing rectangles matching the exact layout shape (3-column KPI row, side-by-side chart pair placeholders, coverage/pension placeholders)
**And** skeletons use consistent pattern: bg-slate-200 animate-pulse rounded
**And** skeleton containers have aria-busy="true" and aria-label="טוען נתונים"
**And** the layout is fully RTL with Tailwind logical properties (ps-, pe-, ms-, me-)
**And** responsive behavior: single column on mobile (320px+), full Story Dense on desktop (1024px+)
**And** an error boundary wraps the dashboard so individual section failures don't crash the entire page

### Story 2.2: Implement KPI Fusion Cards

As a user,
I want to see my total savings, projected monthly pension, and coverage snapshot as prominent KPI cards with plain-Hebrew sentences,
So that I instantly understand my financial big picture.

**Acceptance Criteria:**

**Given** parsed portfolio data is available in context
**When** the KPI section renders
**Then** three KPI Fusion Cards display in a row: Total Savings, Monthly Pension, Coverage Snapshot
**And** each card shows a large number (36px bold Heebo) + plain-Hebrew sentence (16px body) — e.g., "יש לך חיסכון כולל של 452,340 ₪"
**And** numbers are formatted via Intl.NumberFormat('he-IL') with ₪ currency symbol
**And** each card has an optional "see details" link styled with teal color
**And** semantic card tinting applies: healthy (bg-emerald-500/5), attention (border-amber-500/10), neutral (default white)
**And** each card has aria-label combining sentence + value for screen readers
**And** loading state shows skeleton: gray bar for number, two gray lines for sentence
**And** empty state shows card with "אין מידע זמין" message
**And** cards stack vertically on mobile, 3-column grid on desktop
**And** computed KPI values come from the useKPIs() hook

### Story 2.3: Implement Orientation Bar

As a user,
I want to see a confirmation of what data was found — how many products, providers, and employers,
So that I trust the system parsed my files correctly.

**Acceptance Criteria:**

**Given** parsed portfolio data is available
**When** the orientation bar renders below the nav
**Then** it displays inline text with bold counts: "יש לך X מוצרים, Y ספקים, Z מעסיקים"
**And** the bar has a muted background strip (bg-slate-50)
**And** partial data state shows what's available + what's missing
**And** the bar has role="status" and aria-live="polite" for screen reader announcements
**And** on mobile, compact version shows name + date only with expandable details

### Story 2.4: Implement Action Items Cards

As a user,
I want to see my total annual fees and withdrawal eligibility highlighted,
So that I'm aware of actionable financial information.

**Acceptance Criteria:**

**Given** parsed portfolio data with fee and fund maturity information
**When** the action items section renders below the KPI row
**Then** an "Annual Fees" card shows total management fees in NIS/year ("את/ה משלם/ת ₪X בשנה על ניהול")
**And** a "Withdrawal Eligibility" card shows count of products available for withdrawal
**And** cards use the same Card component styling as KPI cards but smaller
**And** fees card uses attention tinting if total fees are above a reasonable threshold
**And** withdrawal card uses info tinting (teal) when products are eligible
**And** empty states show when no relevant data exists
**And** warm micro-copy uses first-person possessive Hebrew patterns

### Story 2.5: Implement Empty State Cards

As a user,
I want clear, friendly messages when data is missing for a section,
So that I understand what's missing and why without feeling confused.

**Acceptance Criteria:**

**Given** a dashboard section has no relevant data from uploaded files
**When** that section renders
**Then** an empty state card appears with: muted background (bg-slate-50), dashed border (border-slate-200), centered text
**And** the message uses warm Hebrew: "אין מידע זמין בנושא זה" or section-specific messages
**And** a subtle outline icon matching the section topic is shown
**And** the card includes an explanation of which file type is needed for this section
**And** empty charts and empty tables are never shown — always replaced with the empty state card
**And** partial data shows available data normally with a footnote: "מבוסס על X מתוך Y מוצרים"

---

## Epic 3: Detailed Views, Drill-Down & Jargon Translation

User can explore every financial product in detail — insurance, savings, pension, Har Habituach — with accordion drill-downs, navigation, and all jargon translated inline.

### Story 3.1: Implement Jargon Translation System and Badge System

As a user,
I want every financial term translated into plain Hebrew I can understand,
So that I never feel confused by technical jargon.

**Acceptance Criteria:**

**Given** the jargon dictionary is populated with Israeli financial terms
**When** jargon terms appear anywhere in the dashboard
**Then** Tier 1 terms are replaced entirely (e.g., "סוג מוצר 6" → "ביטוח חיים")
**And** Tier 2 terms show simplified text with dotted underline + tooltip with full explanation (e.g., "דמי ניהול מצבירה" → "עמלת ניהול חיסכון" with tooltip)
**And** Tier 3 terms show original text with dotted underline + tooltip explanation (e.g., "קרן השתלמות" with tooltip)
**And** tooltip trigger uses: border-b border-dotted border-slate-400 cursor-help
**And** tooltip displays: bg-slate-800 text-white, max-width 280px, 200ms open delay
**And** tooltips work on touch devices: tap to open, tap outside to close
**And** the jargon dictionary lives at src/lib/utils/jargonDictionary.ts as a first-class module
**And** same-tier classification is consistent for each term across the entire dashboard
**And** badge system is implemented: active (emerald), missing (amber), expired (slate), withdrawal eligible (teal) — text-xs px-2 py-0.5 rounded-full font-medium
**And** badges include aria-label with status + context for screen readers

### Story 3.2: Build Insurance Products Detail View

As a user,
I want to see all my insurance products with full details,
So that I understand my insurance coverage and contributions.

**Acceptance Criteria:**

**Given** parsed INP data exists in context
**When** the insurance section renders
**Then** products are displayed as Product Summary Cards grouped by provider
**And** each card shows: provider name, policy number, policy status (with badge), join date (DD/MM/YYYY format), contribution rate, monthly deposit amount, last deposit date
**And** deposit history is available via accordion drill-down
**And** jargon terms use the 3-tier translation system
**And** dates use Israeli format (DD/MM/YYYY)
**And** currency uses Intl.NumberFormat('he-IL') with ₪
**And** empty state shows when no INP data exists
**And** the section uses semantic HTML (section element with appropriate heading)

### Story 3.3: Build Savings Funds Detail View

As a user,
I want to see all my savings and education funds with investment track breakdowns,
So that I understand my savings allocations and returns.

**Acceptance Criteria:**

**Given** parsed KGM data exists in context
**When** the savings section renders
**Then** funds are displayed as cards grouped by fund
**And** each fund card shows: provider name, account number, employer name
**And** investment track breakdown shows per track: track name, balance in NIS, net return percentage, deposit management fee, savings management fee
**And** track type codes are translated via Tier 1 jargon (never show raw codes)
**And** contribution split (employee/employer %) is shown
**And** accordion drill-down provides full track details
**And** numbers use tabular-nums for aligned columns in track lists
**And** empty state shows when no KGM data exists

### Story 3.4: Build Pension Detail View

As a user,
I want to see my pension fund details with all retirement projection scenarios,
So that I understand my retirement outlook.

**Acceptance Criteria:**

**Given** parsed PNN data exists in context
**When** the pension section renders
**Then** pension funds are displayed grouped by employer
**And** each fund shows: provider name, pension type (old/new — translated), insurance track name
**And** a retirement projections table shows all scenarios (up to 8): projected monthly pension in NIS, projected total at retirement, projected return rate
**And** the table uses proper RTL alignment with right-aligned numbers
**And** accordion drill-down shows full projection detail per scenario
**And** jargon terms are translated (pension-specific vocabulary)
**And** empty state shows when no PNN data exists

### Story 3.5: Build Har Habituach Table View

As a user,
I want to see my Insurance Mountain data in a clean, searchable table,
So that I can browse all my active insurance policies from government records.

**Acceptance Criteria:**

**Given** parsed Har Habituach data exists in context
**When** the Har Habituach section renders
**Then** a data table shows all columns from the Excel file with Hebrew headers
**And** columns are sortable (click header to sort ascending/descending)
**And** a search/filter input allows filtering rows by text content
**And** the table uses alternating row backgrounds (bg-slate-50) for readability
**And** numbers use tabular-nums for alignment
**And** the table is responsive: horizontal scroll with sticky first column on mobile
**And** empty state shows when no Har Habituach data exists

### Story 3.6: Implement Section Navigation and Accordion Drill-Down

As a user,
I want to navigate between dashboard sections easily and expand details inline,
So that I can explore my data without losing context.

**Acceptance Criteria:**

**Given** the dashboard is loaded with data
**When** the user interacts with navigation and drill-downs
**Then** section navigation links/tabs are available (ביטוח | קופות גמל | פנסיה | הר הביטוח) that scroll to the relevant section
**And** KPI card "see details" links scroll to the corresponding detail section
**And** accordion drill-downs use shadcn/ui Accordion in single-expand mode
**And** only one accordion is open at a time — opening a new one closes the previous
**And** accordion trigger shows a chevron-down icon that rotates 180° on open (transition-transform duration-200)
**And** drill-down content slides in with animate-accordion-down
**And** drill-down area has visually inset styling (bg-slate-50 border-t border-slate-100)
**And** when accordion opens below viewport, smooth-scroll keeps trigger visible (scrollIntoView behavior: smooth, block: nearest)
**And** keyboard navigation: Enter/Space to toggle accordion, Tab through items
**And** minimum 44x44px touch targets on accordion triggers

### Story 3.7: Implement Responsive Layout and Accessibility

As a user,
I want the dashboard to work well on my phone and be accessible via keyboard and screen reader,
So that I can view my financial data on any device and with assistive technology.

**Acceptance Criteria:**

**Given** the dashboard is loaded
**When** viewed on different screen sizes and with assistive technology
**Then** mobile (320px-767px): single-column layout, stacked KPI cards, full-width charts (min 240px height), stacked sections
**And** tablet (768px-1023px): two-column KPI cards, wider charts, full table layouts
**And** desktop (1024px+): full Story Dense layout with side-by-side chart pairs, 3-column KPIs
**And** no horizontal scrolling except in data tables on mobile
**And** skip link "דלג לתוכן הראשי" is the first focusable element
**And** all interactive elements have visible focus indicators (ring-2 ring-offset-2 ring-blue-500)
**And** semantic HTML is used throughout: main, nav, section, article elements
**And** all KPI numbers have aria-label with Hebrew description
**And** charts have role="img" with aria-label summarizing chart data in text
**And** loading skeletons have aria-busy="true"
**And** prefers-reduced-motion disables skeleton pulse animation
**And** prefers-contrast increases border opacity for status indicators
**And** error states: partial parse shows empty state card per section + footnote, no-files shows full-page centered message

---

## Epic 4: Charts & Visual Analysis

User sees visual breakdowns — savings allocation donut chart, fee comparison bars with NIS/year, coverage status table with badges, deposit sparklines, semantic color coding on cards.

### Story 4.1: Set Up Recharts with RTL Configuration

As a developer,
I want Recharts configured for RTL Hebrew rendering with lazy loading,
So that all charts display correctly in the Hebrew right-to-left layout.

**Acceptance Criteria:**

**Given** the dashboard uses Recharts for data visualization
**When** charts are rendered
**Then** Recharts is lazy-loaded via next/dynamic with ssr: false (charts are client-only)
**And** RTL chart configuration is applied: SVG textAnchor="end" for axis labels
**And** all number formatting in charts uses Intl.NumberFormat('he-IL')
**And** chart color palette uses: navy (#1e3a5f) primary, teal (#0d9488) secondary, slate-500 tertiary, slate-400 quaternary
**And** maximum 4 colors per chart — opacity variations for additional series
**And** all charts wrap in ResponsiveContainer width="100%" with minimum height 240px mobile / 320px desktop
**And** chart containers inherit RTL direction
**And** chart legend appears below chart on mobile, inline on desktop

### Story 4.2: Implement Fee Comparison Bar Chart

As a user,
I want to see a visual comparison of management fees across all my products,
So that I can quickly identify which products charge the most.

**Acceptance Criteria:**

**Given** parsed portfolio data with management fee information from KGM, PNN, and INP products
**When** the fee comparison section renders
**Then** a horizontal bar chart shows all products with fee percentages
**And** each bar row displays: product name label, proportional bar fill, fee percentage, annual NIS cost
**And** annual NIS cost is calculated and displayed alongside percentage ("0.5% · ₪1,240/שנה")
**And** bars use navy/teal fill by default
**And** above-average fee bars use amber fill for attention
**And** the chart is built with Recharts BarChart + custom label renderer
**And** RTL layout: labels on right, bars extend left
**And** responsive: values display below bars on mobile (not overlaid)
**And** empty state when no fee data exists

### Story 4.3: Implement Coverage Status Table

As a user,
I want to see all my coverage types (life, disability, mortgage) with status badges,
So that I know what protects me and my family.

**Acceptance Criteria:**

**Given** parsed data with coverage information from INP and Har Habituach
**When** the coverage section renders
**Then** a table shows coverage rows with 4 columns: coverage type, amount (NIS), provider, status badge
**And** status badges use the badge system: active (emerald "פעיל"), missing (amber "חסר"), expired (slate "לא פעיל")
**And** semantic color tinting: active rows get subtle green tint, missing rows get amber border
**And** badges include aria-label with status + context
**And** the table uses proper RTL alignment
**And** responsive: card-based layout per row on mobile, full table on desktop
**And** color never carries meaning alone — always paired with text label

### Story 4.4: Implement Savings Allocation Donut Chart

As a user,
I want to see a donut chart showing how my savings are allocated across investment tracks,
So that I understand my investment diversification at a glance.

**Acceptance Criteria:**

**Given** parsed KGM data with investment track balances
**When** the savings allocation chart renders
**Then** a donut chart displays with segments proportional to each track's balance
**And** a custom SVG center overlay shows the total savings amount in NIS
**And** the center label handles RTL text correctly
**And** chart colors use the 4-color palette (navy, teal, slate-500, slate-400)
**And** segment labels show track name + balance amount
**And** hover/tap on segments shows detailed tooltip with exact amounts
**And** responsive: chart resizes within ResponsiveContainer, center label scales proportionally
**And** empty state when no savings track data exists

### Story 4.5: Implement Deposit History Sparklines and Semantic Color Coding

As a user,
I want to see deposit trend sparklines on product cards and subtle color coding indicating status,
So that I can spot trends and important items at a glance.

**Acceptance Criteria:**

**Given** parsed data with deposit history and product status information
**When** product cards render with history data
**Then** lightweight sparkline charts show deposit trends inline within Product Summary Cards
**And** sparklines are minimal: no axes, no labels — just the trend line in navy color
**And** sparklines resize responsively within their card container
**And** semantic color coding applies to all relevant cards: healthy (bg-emerald-500/5 background), attention (border-amber-500/10 border)
**And** color tinting appears only where status adds genuine information value
**And** color is never on text — only backgrounds and borders at very low opacity
**And** cards without meaningful status stay neutral white (default)
**And** empty deposit history shows no sparkline (not an empty chart area)

---

## Epic 5: Agent View

Insurance agent can upload client files via drag-and-drop, see per-file parse status, and preview the user dashboard via "view as user" button.

### Story 5.1: Build Agent File Upload Interface

As an insurance agent,
I want a simple interface to upload client files via drag-and-drop and see parse results,
So that I can prepare client dashboards quickly.

**Acceptance Criteria:**

**Given** the agent view is accessed (via ?view=agent URL parameter or top-bar toggle)
**When** the agent interface loads
**Then** a drag-and-drop upload zone is displayed with dashed border and Hebrew instruction text ("גרור קבצים לכאן")
**And** the zone accepts .DAT and .xlsx files (multiple files at once)
**And** the zone highlights on drag-hover (border color change)
**And** after files are dropped, each file shows: file name, recognized type, record count, status badge (✓ parsed / ✗ error)
**And** error files show specific error message in Hebrew + "נסה שוב" (try again) link
**And** error display pattern: bg-red-50 border border-red-200 text-red-700 rounded-md p-3
**And** the interface is functional and minimal — not a UX priority, just usable
**And** agent footer displays: "יש לך שאלות? דבר/י עם הסוכן שלך · המידע מבוסס על קבצים שהועלו ואינו מהווה ייעוץ פיננסי"

### Story 5.2: Implement View Toggle and "View as User"

As an insurance agent,
I want to switch between agent view and user dashboard view,
So that I can preview what my client will see.

**Acceptance Criteria:**

**Given** the agent has uploaded files and parsing is complete
**When** the agent clicks "view as user" button or toggles view
**Then** the user dashboard renders with the uploaded client's parsed data
**And** a view toggle is accessible via URL parameter (?view=agent) or a simple top-bar toggle
**And** the default view is the user dashboard
**And** toggling back to agent view preserves the uploaded files and parse state
**And** no authentication is required for either view
**And** the toggle is visible but unobtrusive — dev/testing feature only
