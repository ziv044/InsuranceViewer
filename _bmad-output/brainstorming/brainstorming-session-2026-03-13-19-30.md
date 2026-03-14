---
stepsCompleted: [1, 2, 3, 4]
session_active: false
workflow_completed: true
inputDocuments: []
session_topic: 'Israeli insurance & financial products application leveraging Mislaka and Har Habituach government data'
session_goals: 'Define product vision, features, competitive differentiation, and MVP scope'
selected_approach: 'ai-recommended'
techniques_used: ['Role Playing', 'SCAMPER Method', 'First Principles Thinking']
ideas_generated: []
context_file: ''
---

# Brainstorming Session Results

**Facilitator:** Ziv04
**Date:** 2026-03-13

## Session Overview

**Topic:** Israeli insurance & financial products application leveraging Mislaka and Har Habituach government data
**Goals:** Define product vision, features, competitive differentiation, and MVP scope

### Context Guidance

- **Team:** 4 partners — senior developer, 2 insurance agency domain experts, and Ziv04
- **Data Sources:** Mislaka XML (INP=insurance, KGM=Keren Gemel, PNN=pension) + Har Habituach Excel — provided via API
- **Competitors:** FINQ, Cover
- **Market:** Israeli regulated insurance & financial products (car, life, health, accidents, pension, Keren Hishtalmut, savings)

### Session Setup

Session configured for strategic product ideation with AI-recommended technique sequence designed to move from real pain points through competitive analysis to focused MVP definition.

## Technique Selection

**Approach:** AI-Recommended Techniques
**Analysis Context:** Insurance/financial product app with focus on competitive differentiation and MVP scope

**Recommended Techniques:**

- **Role Playing:** Ground brainstorming in real stakeholder pain points across the insurance ecosystem
- **SCAMPER Method:** Systematically generate product features by dissecting competitor approaches and data capabilities
- **First Principles Thinking:** Strip to fundamentals to define clear MVP scope and product thesis

**AI Rationale:** Session requires both creative product vision and structured analysis. The team's unique strength — domain expertise from insurance agents + dev capability + real government data — calls for a sequence that mines real-world knowledge, generates competitive features, then focuses ruthlessly on differentiation.

## Technique Execution Results

**Role Playing (Partially Completed):**

- **Interactive Focus:** End-user perspective — what do real users look for first, what confuses them
- **Key Breakthroughs:** Users care about per-product balance first; jargon and data overload are the #1 pain points
- **User Creative Strengths:** Direct, practical insights from domain knowledge
- **Energy Level:** Focused and efficient — user preferred to move quickly

**SCAMPER Method:** Skipped by user request

**First Principles Thinking (Completed):**

- **Interactive Focus:** "What is the minimum viable screen?" — answered with actual Mislaka PDF (8 pages)
- **Key Breakthroughs:** The real Mislaka report reveals 6 major data sections missing from current prototype
- **Critical Finding:** Design should mirror what users already expect from the Mislaka PDF format
- **Energy Level:** High — PDF analysis triggered the biggest insights of the session

**Overall Creative Journey:** Session was compact but highly productive. The breakthrough moment came when the user shared the actual Mislaka PDF, revealing that the prototype was designed from XML field names rather than from user expectations. The PDF showed the real structure users are familiar with — coverage details, fee breakdowns, deposit splits, and withdrawal eligibility — most of which were missing.

### Ideas Generated

**[UX #1]**: The Money Map
_Concept_: Per-product balance breakdown as the primary view. Users want to see "how much is saved in each product" immediately — not aggregated totals or provider groupings.
_Novelty_: Inverts typical dashboard approach (aggregate first → drill down) to product-first layout matching user mental model.

**[UX #2]**: The Jargon Translator
_Concept_: Inline tooltips and plain-Hebrew explanations for every financial term (דמי ניהול, מסלול השקעה, כיסוי ביטוחי). Users reported "too much data, definitions and terms" as the #1 frustration.
_Novelty_: Treats financial literacy as a UX problem, not a documentation problem. Contextual help instead of a glossary page.

**[UX #3]**: The "Am I OK?" Meter
_Concept_: Simple emotional summary before data drill-down. A traffic-light or sentiment indicator answering "is my financial situation healthy?" before showing any numbers.
_Novelty_: Addresses emotional need before informational need. Most financial tools lead with data; this leads with reassurance.

**[Architecture #4]**: Mirror the Mislaka PDF
_Concept_: Design screens from the user's existing mental model (the Mislaka PDF report) rather than from XML field structure. The PDF has a specific layout users already know — replicate its sections in the app.
_Novelty_: User-expectation-driven design vs. data-structure-driven design. Reduces cognitive load by matching familiar format.

**[Data Gap #5]**: Insurance Coverage Section (כיסויים ביטוחיים)
_Concept_: The Mislaka PDF prominently shows death benefits (₪1,645,549), disability coverage, and mortgage insurance. These are completely absent from the current prototype.
_Novelty_: Coverage details are arguably the most important insurance data — what you're actually covered for.

**[Data Gap #6]**: Management Fees Breakdown (דמי ניהול)
_Concept_: The PDF shows dual fee structure — deposit fee % (1.49%) + savings fee % (0.10%). Current prototype doesn't surface fee breakdowns at all.
_Novelty_: Fees are the #1 area where users can save money. Making them visible and comparable is a core value proposition.

**[Data Gap #7]**: Monthly Deposit Split
_Concept_: Employee contribution (₪23,884) vs employer contribution (₪36,085) clearly separated. Shows who is paying what.
_Novelty_: Essential for understanding total compensation package and retirement planning.

**[Data Gap #8]**: Risk Insurance Details
_Concept_: Premium amount, death cover amount, coverage expiry date — the "what happens if" section.
_Novelty_: Transforms abstract policy numbers into concrete protection understanding.

**[Data Gap #9]**: Withdrawal Eligibility (מועד זכאות למשיכה)
_Concept_: Clear status indicator: "ניתן למשיכה" (available for withdrawal) vs locked. Users need to know when they can access their money.
_Novelty_: Actionable information that directly affects financial decisions.

**[Data Gap #10]**: Color-Coded Tax Rules
_Concept_: The Mislaka PDF page 8 uses a red/orange/yellow/blue color system for tax withdrawal rules. Replicating this visual system would leverage an existing government convention users may recognize.
_Novelty_: Adopting government visual language builds trust and reduces learning curve.

### Creative Facilitation Narrative

_This session was efficient and insight-dense. The user demonstrated strong domain knowledge, cutting quickly to what matters. The breakthrough moment was sharing the actual Mislaka PDF — it revealed that the current prototype was built from the data structure up rather than from the user experience down. The PDF showed 6 major data categories missing from the app, each representing core user needs. The session's key lesson: design from the report users already know, not from the XML schema._

### Session Highlights

**User Creative Strengths:** Domain expertise, practical focus, ability to cut through abstraction to real user needs
**AI Facilitation Approach:** Adapted to user's efficient style — less coaching, more direct exploration
**Breakthrough Moments:** Mislaka PDF analysis revealing 6 missing data sections
**Energy Flow:** Compact but high-impact — quality over quantity approach

## Idea Organization and Prioritization

**Thematic Organization:**

| Theme | Ideas | Pattern |
|-------|-------|---------|
| UX Design | Money Map, Jargon Translator, "Am I OK?" Meter | Lead with clarity and emotion, not raw data |
| Data Gaps | Coverage, Fees, Deposits, Risk, Withdrawal, Tax Rules | 60% of Mislaka PDF data missing from prototype |
| Design Philosophy | Mirror PDF, Color-Coded Tax Rules | Match user's existing mental model |

**Prioritization Results:**

- **Top Priority:** Mirror the Mislaka PDF (foundational shift), Management Fees, Jargon Translator
- **Quick Wins:** Withdrawal Eligibility, Monthly Deposit Split, Color-Coded Tax Rules
- **Breakthrough Concepts:** "Am I OK?" Meter (emotional-first UX, no competitor does this)

**Action Plans:**

1. **Full XML audit** — Map every XML field to PDF sections, identify gaps and bonus data
2. **Restructure views** to match Mislaka PDF layout
3. **Parse missing fields** — fees, coverage, deposits, withdrawal, risk insurance
4. **Build Jargon Translator** — glossary + tooltip component
5. **Add fee comparison** — the core value proposition

## Session Summary

**Key Achievements:** Identified 6 critical data gaps, established PDF-driven design philosophy, prioritized 5 action items
**Session Lesson:** Design from the report users know, not from the XML schema
**Next Action:** Full XML field audit against Mislaka PDF
