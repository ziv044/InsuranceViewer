# PM Notes — InsuranceViewer Elevation Items

## Context
The app is a white-label "איזור אישי" offered by insurance agencies to their customers.
Two lenses: (1) end-user value, (2) agency business value (leads, retention, reduced support).

---

## Item 1: Agent Contact CTA Buttons
**Priority:** HIGH | **Effort:** Small
- Add "דבר/י עם הסוכן" button throughout the app
- Every recommendation card should have a CTA
- Every warning/alert (high fees, missing coverage) should link to agent contact
- Turns insights into qualified leads for the agency
- Implementation: a floating contact button + contextual CTAs on recommendation cards, fee displays, and alerts

## Item 2: INP Insurance Data Drill-Down
**Priority:** HIGH | **Effort:** Medium
- INP (insurance product) XML data is fully parsed but **completely unused** in the UI
- Insurance tab currently only uses Har Habituach (Excel) — shows category grid with monthly premium
- Build detail views for insurance products similar to savings tab detail view
- Show: policy number, coverage amounts (סכום ביטוח), who's covered, premium breakdown, beneficiaries, exclusions, claims status, fee structure
- Data is already in `ParsedINP` / `InsuranceProduct` / `InsuranceCoverage` types

## Item 3: Expanded Recommendations Engine
**Priority:** HIGH | **Effort:** Medium
- Current engine has only 3 rules (health exists, life exists, duplicate health)
- Add these checks using existing data:
  - **Fee health**: compare deposit/savings fees to market averages, flag if above benchmark
  - **Beneficiary gaps**: flag products with no beneficiaries defined (data exists in KGM/PNN)
  - **Inactive products with balance**: flag inactive (status != "1") products that still have money — suggest consolidation
  - **Pension adequacy**: if projected monthly pension < threshold relative to salary, warn
  - **Coverage gaps by life stage**: use age + marital status to suggest missing coverage types
  - **Loan/debt alerts**: surface active loans and debts more prominently as recommendations
- Each recommendation should include an agent CTA (see Item 1)

## Item 4: Personalized Greeting & Profile Header
**Priority:** MEDIUM | **Effort:** Small
- `ClientInfo` has firstName, lastName — use it in the header
- Replace empty header with "שלום, [firstName]" greeting
- Add agency branding placeholder (logo, agent name)
- Makes the app feel personal, not generic

## Item 5: Unified Home Dashboard
**Priority:** MEDIUM | **Effort:** Small
- Home tab currently only shows savings donut chart
- Add summary cards:
  - Total savings: X₪ (already exists)
  - Total monthly insurance cost: Y₪/month (data exists from Har Habituach)
  - Number of active policies
  - Number of alerts/action items from recommendations
  - Last data refresh date
- Gives users a reason to open the app regularly

## Item 6: Fee Benchmarking
**Priority:** HIGH | **Effort:** Medium
- Currently shows fee rates (deposit fee %, savings fee %) with no context
- Add market average benchmarks so user knows if their fees are good or bad
- Visual indicator: green (below avg), yellow (avg), red (above avg)
- "Above average" fees → natural agent CTA: "בדוק עם הסוכן אם ניתן להוזיל"
- Benchmark data can be hardcoded initially (industry averages are publicly available)

## Item 7: Insurance Renewal / Expiry Alerts
**Priority:** HIGH | **Effort:** Medium
- Parse policy dates from Har Habituach and/or INP data
- Show "coming up for renewal" section on home or insurance tab
- "הפוליסה שלך מתחדשת בעוד 30 יום" → agent CTA
- Creates recurring engagement — users come back before renewal
- Natural touchpoint for agency to re-engage client

## Item 8: Data Freshness Indicator
**Priority:** MEDIUM | **Effort:** Small
- Show when data was last updated: "נתונים נכונים ל-03/2026"
- Source: `FileHeader.executionDate` from parsed XML files
- Reduces "is this up to date?" support calls
- Optional: "בקש עדכון נתונים" button → sends request to agent

## Item 9: Change Notifications / What's New
**Priority:** MEDIUM | **Effort:** Large
- Track changes between data refreshes
- Highlight deltas: "היתרה בקרן הפנסיה עלתה ב-2,300₪"
- Show on home tab as a "what's changed" section
- Requires storing previous state for comparison
- Creates a reason for repeat visits → higher retention

## Item 10: Agency White-Label Configuration
**Priority:** MEDIUM | **Effort:** Medium
- Agency logo, colors, agent name and photo in header
- Configurable theme (primary color, accent color)
- Agent contact info (phone, email, WhatsApp)
- Table-stakes for a white-label SaaS product

---

## Suggested Build Order

| Phase | Items | Focus |
|-------|-------|-------|
| Phase 1 | 1, 4, 5, 8 | Quick wins — CTA, personalization, unified home |
| Phase 2 | 2, 3, 6 | Core value — INP drill-down, smart recommendations, fee context |
| Phase 3 | 7, 10 | Business value — renewals, white-label |
| Phase 4 | 9 | Retention — change tracking |
