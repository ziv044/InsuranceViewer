---
stepsCompleted: [1, 2, 3, 4]
elicitationApplied: [user-persona-focus-group, pre-mortem, critique-and-refine, first-principles, cross-functional-war-room]
inputDocuments:
  - prd-insurance-viewer.md
  - ux-mockups-insurance-viewer.md
  - market-israeli-insurtech-competitors-research-2026-03-13.md
  - brainstorming-session-2026-03-13-19-30.md
---

# UX Design Specification InsuranceViewer

**Author:** Ziv04
**Date:** 2026-03-14

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

"Upload. See. Understand." — InsuranceViewer is a privacy-first, Hebrew-language (RTL) web application that transforms opaque Israeli government insurance files (Mislaka .DAT and Har Habituach .xlsx) into professional, chart-rich dashboards. All processing happens client-side — zero server storage, no accounts, no credentials shared, no commissions.

The application has two views accessible via a simple toggle (for development/testing purposes only — not a production feature):
- **Agent View:** Minimal file upload and client management interface — functional, not designed
- **User View:** The core product — professional dashboards with rich charts, visual highlights, and clear data presentation

### Target Users

**Primary Persona — End User ("The Confused Saver"):**
- Ages 25-45, multiple scattered insurance/pension/savings products
- Overwhelmed by financial jargon, doesn't understand what they have
- Needs professional, visual dashboards that highlight what matters — fees, coverage, projections, withdrawal eligibility
- Wants to answer: "What do I have? Am I OK? What should I pay attention to?"
- Does NOT upload files — views data prepared by their insurance agent

**Secondary Persona — The Optimizer:**
- Financially literate, wants detailed breakdowns and fee comparisons
- Appreciates chart-rich, data-dense professional presentation

**Agent (Dev/Testing only):**
- Insurance agent who uploads client files
- Simple functional UI — file upload, client list, basic management
- Not a UX priority for this phase

### Key Design Challenges

1. **Professional dashboard UX:** Rich charts, visual hierarchy, and data visualization for complex Israeli financial data — must feel polished and trustworthy, not like a prototype
2. **Hebrew RTL data visualization:** Charts, tables, and numerical data (NIS, percentages, dates) in full RTL layout with proper alignment
3. **Making the complex simple:** Surface actionable highlights (high fees, missing coverage, withdrawal eligibility) through visual cues — not just raw data tables
4. **Information density balance:** Enough depth for the Optimizer, enough clarity for the Confused Saver — progressive disclosure through drill-down
5. **Trust without accounts:** No login means no saved state — the privacy-first approach must be communicated visually throughout

### Design Opportunities

1. **Chart-rich professional dashboards:** Pie charts for allocation, bar charts for fee comparison, line/area charts for projections — making financial data visually intuitive
2. **"Mirror the Mislaka PDF" structure:** Organize sections to match what users already recognize from government reports, reducing cognitive load
3. **Highlight-driven design:** Visual callouts for important items — color-coded fee levels, coverage status indicators, withdrawal eligibility badges
4. **Jargon translation as UX:** Inline plain-Hebrew tooltips for every financial term
5. **Competitive gap:** No Israeli competitor offers instant, zero-conflict, chart-rich visualization of government insurance data

### User Persona Validation

**Focus group reactions to the dashboard concept from both target personas:**

**Dana, 32, "The Confused Saver"** — Marketing manager, has pension and savings from 3 jobs, never looked at her Mislaka report:
- Wants one big total number first — don't make her add things up
- Needs color-coded fee indicators (good/bad) — "is 1.49% green or red?"
- Asks about death/disability coverage — "what happens if?" answered simply
- Wants withdrawal eligibility clearly shown — "can I touch this money yet?"
- Will close the tab if she sees raw field names or unexplained jargon

**Eyal, 41, "The Optimizer"** — Software engineer, reads financial press, tracks his portfolio:
- Wants fee comparison across all products side by side
- Needs investment track performance with allocation breakdown (stocks vs. bonds)
- Expects all 8 pension projection scenarios, not just a range
- Demands access to every data point — progressive disclosure is fine, but nothing hidden

**Progressive Disclosure Strategy (Resolving the Tension):**

| Layer | Audience | Content |
|-------|----------|---------|
| **Layer 1 — Dashboard** | Dana (Confused Saver) | Totals, highlights, color-coded status, simple charts |
| **Layer 2 — Drill-down** | Eyal (Optimizer) | Full data tables, fee comparisons, all projection scenarios, track detail |
| **Layer 3 — Tooltips** | Both | Inline jargon translation on hover — helpful for Dana, ignorable by Eyal |

The dashboard leads with **emotional clarity** (totals, status colors, "you have X products across Y providers") and offers **"see details"** expansion for every section.

### Pre-mortem: UX Risk Analysis

**Identified failure scenarios and preventive design decisions:**

| Risk | Impact | Likelihood | Prevention |
|------|--------|------------|------------|
| **RTL chart rendering bugs** — labels overlap, numbers backwards, % sign misplaced | High | High | Chart library must be RTL-tested exhaustively. Hebrew locale number formatting (₪1,234.56). Validate percentage placement |
| **Data trust breach** — numbers don't match the Mislaka PDF users already have | High | Medium | Match source values exactly, never round differently. Label any derived/calculated numbers as "calculated by InsuranceViewer" |
| **Overwhelming with many products** — works for sample data, breaks with 6+ real products | Medium | High | Design for the heavy case first. Collapsible sections, summary counts, expand/collapse per provider. Stress-test with max realistic data |
| **"Toy" aesthetic** — looks like a startup demo, not a serious financial tool | High | Medium | Professional financial aesthetic — clean, authoritative, muted palette. Reference banking/government tools, not trendy design |
| **Navigation/findability** — users scroll forever looking for their pension data | Medium | Medium | Persistent tab navigation (ביטוח &#x7C; גמל &#x7C; פנסיה &#x7C; הר הביטוח) visible at all times. Never make users hunt for a category |
| **Implied recommendations** — color-coded fees interpreted as financial advice | Medium | Low | Compare to market averages with source attribution, not subjective good/bad. Explicit disclaimer: "this is data, not advice" |

### Scope Clarifications

**User View — Dashboard Sections (organized by user need, not data source):**

Data from multiple file types is blended wherever it serves the user. Sections are organized by "what the user wants to know", not by which XML file it came from.

- **Overview:** The "big picture" KPI dashboard — total savings (₪), projected monthly pension (₪), coverage snapshot (death benefit total, disability yes/no), total annual fees paid (₪), number of products/providers/employers, withdrawal eligibility summary
- **Savings & Investments:** Fund balances, investment track allocation, returns — combined from KGM + relevant PNN data. Use familiar Hebrew terms in headings ("קרן השתלמות" not "מסלול השקעה")
- **Pension & Retirement:** Projected monthly pension as primary number, with all 8 scenarios available in drill-down including assumptions (return rate, salary growth) — from PNN
- **Insurance & Coverage:** Active policies, death/disability coverage, risk insurance — combined from INP + Har Habituach. Coverage highlights also surfaced on Overview
- **Fees:** Management fees across ALL products side by side — combined from KGM, PNN, INP. Show both percentages AND annual NIS cost ("you pay ₪X/year"). Horizontal bar chart comparing all products
- **Deposits & Contributions:** Employee vs employer splits shown inline within each product's detail view. Optional consolidated "all deposits" view for power users

**Agent View (Minimal scope):**
- Client list with names
- File upload per client (drag-and-drop, multiple files)
- Status indicator per file (parsed/error)
- "View as user" button to switch to user dashboard for selected client

**View Toggle:**
- Dev/testing only — implement as URL query parameter (`?view=agent`) or simple top-bar toggle
- Default view: User dashboard
- No authentication required for either view

**Platform:**
- Desktop-first for MVP — charts and data tables optimized for 1024px+
- Basic responsive layout for tablet, but mobile is not a priority

**Empty & Error States:**
- Missing data category: Show section with "no data found" message and explanation of which file type is needed
- Parse error: Show file status with specific error and "try re-uploading" option
- Partial data: Show what's available, indicate what's missing

### Persona-Validated Design Decisions

Based on focus group reactions to the dashboard sections:

1. **Coverage belongs on Overview** — both personas agree death/disability coverage is high-impact and should be visible immediately, not buried in a sub-section
2. **Fees must show NIS amounts** — "you pay ₪X/year" is universally understood; "0.5% דמי ניהול" only helps the Optimizer. Always show both
3. **Use familiar Hebrew terms** — section headings use words users know ("קרן השתלמות", "פנסיה"), technical XML field names only appear in tooltips
4. **Deposits fold into products** — not a standalone section for most users; deposit splits shown inline per product with optional consolidated view
5. **Overview must be KPI-dense** — 6-8 key indicators on one screen: total savings, projected pension, coverage totals, annual fees, product count, withdrawal eligibility

### Information Hierarchy — First Principles

**Core principle:** Lead with answers, not navigation. The user has 30 seconds of attention.

**Visual hierarchy (top to bottom):**

**1. Orientation Bar (always visible)**
Inventory of what was found — "3 pension products, 1 savings fund, 3 policies, 4 providers." Builds trust by confirming the system parsed their data correctly and they recognize their own financial life.

**2. The Big Three (equal weight, primary KPIs)**

| Card | Data | Emotional need |
|------|------|---------------|
| Total Savings | Sum across all products (₪) | Relief / anxiety |
| Monthly Pension | Projected retirement income (₪/month) | Future security |
| Coverage Snapshot | Death benefit total + disability (yes/no) | Family safety |

**3. Action Items (smaller, alert-style cards)**

| Card | Data | Why it's actionable |
|------|------|-------------------|
| Annual Fees | Total fees paid in ₪/year | "Am I getting ripped off?" — drives agent conversations |
| Withdrawal Eligibility | "2 products available for withdrawal" | "Can I access money?" — time-sensitive opportunity |

**4. Drill-down Sections**
Detailed views per category — Savings & Investments, Pension, Insurance & Coverage, Fees Comparison. Accessed via "see details" links from the overview cards, or via persistent section navigation.

**Design principle:** Orientation → Big Three → Action Items → Drill-down. This inverts the typical dashboard pattern (tabs first) by leading with emotional anchors and letting navigation happen naturally through exploration.

### Visualization & Chart Decisions

**Chart Library: Recharts**
- SVG-based, React-native, tree-shakeable (~45KB gzipped)
- Best RTL control via SVG `textAnchor` manipulation
- Print/screenshot friendly (SVG renders natively)

**RTL Strategy:**
- Container `direction: rtl` + SVG `textAnchor='end'` for labels
- Number formatting via `Intl.NumberFormat('he-IL')` throughout
- Don't fight the library — work with SVG primitives for Hebrew text

**Chart Type Map:**

| Section | Chart Type | Notes |
|---------|-----------|-------|
| Overview — Big Three | KPI Cards (no chart) | Numbers are the hero. Charts would distract |
| Savings — Track Allocation | Donut chart | Portfolio split with center total ₪ (custom overlay) |
| Savings — Returns | Horizontal bar chart | Comparing returns across tracks. Horizontal works naturally in RTL |
| Pension — Projections | Range on overview + full table in drill-down | Not an area chart — 8 discrete scenarios, not continuous. Matches Mislaka PDF format |
| Fees — Comparison | Annotated horizontal bar chart | Bars show %, labels show ₪/year. No dual axis (confusing) |
| Insurance — Coverage | Table with status indicators | Coverage amounts per type (death, disability, mortgage) |
| Deposits — History | Sparklines | Lightweight trend lines inline within product cards |

**Technical Constraints:**
- Responsive: set minimum bar heights on tablet, truncate long Hebrew labels with ellipsis + tooltip
- Donut center-label: custom SVG overlay (~20 lines), needs RTL text handling
- Agent print use case: SVG charts render well in print for client presentations

## Core User Experience

### Defining Experience

**The core interaction:** User opens the dashboard and instantly comprehends their financial life. No actions required — no uploads, no configuration, no onboarding. The data is already there (uploaded by their agent). The "wow" moment is the transition from "I have no idea what I have" to "I can see everything clearly" in under 5 seconds.

**The core loop:**
1. User opens dashboard → sees Overview with Big Three KPIs
2. Something catches their eye (a number, a highlight, an alert) → clicks to drill down
3. Drill-down shows full detail with jargon translated inline → user understands
4. User returns to overview or explores another section

There is no "task" — this is a comprehension tool, not a workflow tool. Success is measured by understanding, not by completing actions.

### Platform Strategy

- **Web application** (Next.js) — desktop-first, 1024px+ optimized
- **Mouse/keyboard primary** — hover tooltips, click drill-downs
- **No offline requirement** — data is session-based, no persistence needed
- **No device-specific capabilities** — pure web standards
- **Agent uploads separately** — user view is read-only, all data pre-loaded

### Effortless Interactions

**What should happen automatically (zero user effort):**
- Auto-detect file types from uploaded .DAT/.xlsx files
- Auto-organize data into user-centric sections (not by file type)
- Auto-calculate derived values: total savings, total fees in ₪/year, coverage totals
- Auto-surface highlights: high fees, missing coverage, withdrawal-eligible products
- Auto-translate jargon: every technical term has a plain-Hebrew companion without the user asking for it

**What competitors make painful that we eliminate:**
- No credential sharing (Cover/FINQ require government login)
- No 3-day wait for data (instant parsing)
- No sign-up or account creation
- No subscription or commission pressure
- No black-box AI recommendations to distrust

### Jargon Translation Tiers

Not all jargon is equal. Three tiers of translation ensure clarity without tooltip overload:

| Tier | Strategy | Example |
|------|----------|---------|
| **Tier 1 — Replace entirely** | Code numbers and internal identifiers never shown to users | "סוג מוצר 6" → "ביטוח חיים" |
| **Tier 2 — Simplify + tooltip** | Technical terms rewritten in plain Hebrew, with tooltip for full meaning | "דמי ניהול מצבירה" → "עמלת ניהול חיסכון" (tooltip: "העמלה שהחברה גובה מהכסף שנצבר") |
| **Tier 3 — Tooltip only** | Terms users might recognize, kept as-is with optional explanation | "קרן השתלמות" → kept, tooltip: "חיסכון לטווח בינוני עם הטבת מס" |

The best translation is one the user never notices — Tier 1 terms disappear entirely, Tier 2 terms read naturally, Tier 3 terms are there if you need them.

### Critical Success Moments

**Make-or-break: Jargon comprehension**
The #1 reason users currently fail to understand their insurance data is jargon. If a user sees "דמי ניהול מצבירה 0.10%" and doesn't understand it, the entire tool fails regardless of how beautiful the charts are.

**First-time success moment:** User opens dashboard → sees total savings number → recognizes it as roughly correct → trust established → explores further. If the first number they see feels wrong or incomprehensible, they close the tab.

**Delight moment:** User discovers something they didn't know — coverage amounts, fee totals, withdrawal eligibility — information that was buried in PDFs they never read.

**Handling negative discoveries:** The tool must handle bad news (no coverage, high fees, low pension projection) with neutral presentation. No red alarms or panic-inducing visuals. Present data factually with a gentle contextual hint: "יש לך שאלות? דבר/י עם הסוכן שלך" ("Have questions? Talk to your agent"). This completes the value chain without crossing into recommendations.

### Agent Touchpoint

A subtle but clear "have questions? Talk to your agent" contextual hint — not a CTA button, not a recommendation. A footer note or contextual line that naturally connects comprehension to action. This serves the business model (agents are the paying customers) without compromising the "no recommendations" principle.

### Experience Principles

1. **Comprehension over interaction** — The user's job is to understand, not to do. Every design choice serves clarity
2. **Answers before navigation** — Lead with KPIs and highlights, not with menus and tabs. The dashboard answers questions the user didn't know to ask
3. **Translate everything** — No financial jargon survives without a plain-Hebrew companion. Use the three-tier translation system: replace, simplify, or tooltip
4. **Trust through transparency** — Show source values unmodified. Label calculations. Match the Mislaka PDF numbers exactly. Trust is earned by accuracy, not by branding
5. **Professional, not playful** — This is about people's life savings and family protection. The aesthetic must command respect, not charm
6. **Inform, don't alarm** — The tool reveals reality neutrally. Negative data (high fees, missing coverage) is presented factually, never with panic-inducing visuals. The tool doesn't grade you

## Desired Emotional Response

### Primary Emotional Goals

**The core feeling: "I finally understand."**

InsuranceViewer's emotional purpose is to transform confusion into clarity. The user should feel like someone turned on the lights in a dark room — everything was always there, they just couldn't see it.

| Moment | Target Emotion | Design Driver |
|--------|---------------|---------------|
| Dashboard loads | **Confidence** — "this looks serious and trustworthy" | Professional aesthetic, clean layout, accurate numbers |
| Seeing the Big Three | **Relief** — "I can finally see the full picture" | Single-screen overview, no scrolling required for key facts |
| Discovering coverage | **Empowerment** — "now I know what protects my family" | Coverage snapshot on overview, clear NIS amounts |
| Seeing fees | **Informed awareness** — "I know what I'm paying now" | Neutral presentation with NIS/year, no judgment |
| Exploring drill-downs | **Control** — "I can go as deep as I want" | Progressive disclosure, everything accessible |
| Returning to overview | **Orientation** — "I always know where I am" | Persistent nav, clear back paths |

### Emotional Journey Map

**First open:** Curiosity → Recognition → Trust → Relief
"what's this?" → "I see my data" → "numbers look right" → "I get it"

**Exploration:** Interest → Understanding → Empowerment
"what's this section?" → "oh, that's what it means" → "now I know"

**Bad news:** Surprise → Calm awareness → Motivation
"I have no disability coverage?" → "ok, noted" → "I'll ask my agent"

**Leaving:** Satisfaction → Retained knowledge
"I understand my situation now" → tells spouse/friend what they learned

### Shared Viewing Context

Most users will first see this dashboard while sitting across from their insurance agent. The emotional context includes:
- User is already somewhat anxious (meeting about finances)
- Agent is presenting (needs the tool to make them look competent)
- Both are looking at the same screen

The dashboard's emotional tone serves a **conversation between two people**. The Big Three KPIs become conversation starters. The drill-downs become "let me show you this" moments. The tool facilitates dialogue, not replaces it.

### Micro-Emotions

**Critical emotional states to cultivate:**

- **Trust over skepticism** — The first number must feel right. Professional aesthetic, exact source values, no "magic" calculations without explanation
- **Confidence over confusion** — Every term is understandable (three-tier jargon system). The user never feels stupid
- **Calm awareness over anxiety** — Even negative findings (high fees, no coverage) are presented neutrally. The tool informs, never alarms
- **Control over helplessness** — The user can explore any direction, go deep or stay high-level. Nothing is hidden, nothing is forced

**Emotions to actively prevent:**
- **Overwhelm** — too much data at once (solved by progressive disclosure)
- **Distrust** — numbers that don't match their existing knowledge (solved by exact source values)
- **Shame** — feeling judged for having high fees or low savings (solved by neutral presentation, no grading)
- **Dependency** — feeling they need the tool to make decisions (solved by no recommendations, just data)

### Warm Micro-Copy

Professional warmth through language, not design gimmicks:

| Pattern | Cold (avoid) | Warm (use) |
|---------|-------------|-----------|
| Orientation | "נמצאו 3 מוצרי פנסיה" | "יש לך 3 מוצרי פנסיה" |
| Empty state | "לא נמצאו נתונים" | "לא קיבלנו קובץ פנסיה עדיין" |
| Error | "שגיאה בקריאת הקובץ" | "לא הצלחנו לקרוא את הקובץ — נסה להעלות שוב" |
| Fees | "דמי ניהול: 1.49%" | "את/ה משלם/ת ₪1,240 בשנה על ניהול" |

First-person possessive Hebrew ("יש לך", "שלך") — the data belongs to the user, the language reflects that.

### Loading Experience

For a tool that promises instant comprehension, even 1 second of blank screen breaks the emotional promise:

- **Skeleton UI** — shows layout structure immediately (card shapes, chart placeholders)
- **Progressive rendering** — KPI numbers appear first (fastest to calculate), charts render after
- **No loading spinners** — spinners signal "wait"; skeleton UI signals "almost there"
- The feeling of speed is as important as actual speed

### Design Implications

| Emotional Goal | UX Decision |
|---------------|-------------|
| Trust | Professional color palette (deep blues, muted tones), exact numbers from source, "data from your files" attribution |
| Relief | Big Three KPIs visible without scrolling, single-screen overview |
| Confidence | Three-tier jargon translation, familiar Hebrew terms, tooltips everywhere |
| Calm awareness | No red/green judgment colors for fees. Neutral color palette for data. Amber only for genuinely missing data |
| Control | Persistent navigation, clear drill-down paths, expandable sections, nothing hidden |
| Empowerment | Coverage and fees surfaced proactively — information the user didn't know to look for |
| Warmth | First-person possessive micro-copy, helpful empty states, conversational tone |

### Emotional Design Principles

1. **Clarity is the emotion** — The feeling of understanding IS the product's emotional payoff. Every pixel serves comprehension
2. **Respect the weight** — This is life savings, family protection, retirement security. The design must honor the gravity of the data
3. **Neutral is not cold** — Present data without judgment but with warmth through micro-copy. Professional and human, not clinical and sterile
4. **No emotional manipulation** — No gamification, no urgency, no fear-based alerts. Pure information, respectfully presented
5. **The agent completes the emotional loop** — The tool creates understanding; the agent creates action. "Have questions? Talk to your agent" is the natural emotional exit
6. **Design for two viewers** — The dashboard is often a shared screen between agent and client. KPIs start conversations, drill-downs are "let me show you" moments
