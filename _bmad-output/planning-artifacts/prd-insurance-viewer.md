---
document_type: PRD
version: 1.0
date: 2026-03-13
author: John (PM Agent) + Ziv04
status: draft
---

# Product Requirements Document: InsuranceViewer

## 1. Product Overview

### Vision Statement
**"העלה. ראה. הבן."** (Upload. See. Understand.)

A privacy-first, Hebrew-language web application that instantly transforms opaque Israeli government insurance files into clear, visual dashboards. No sign-up, no credentials shared, no commissions, no server storage. Just upload your Mislaka and Har Habituach files and understand your financial picture.

### Problem Statement
Israeli citizens accumulate insurance, pension, and savings products across multiple providers throughout their careers. This data is scattered, complex, and opaque. Existing solutions (Cover, FINQ) require sharing government credentials, waiting 3 days for data, and operate on commission/subscription models that create conflicts of interest. Most Israelis don't understand what they have or what they're paying.

### Product Thesis
A transparent visualization tool — not an advisor, not a broker, not an AI. A mirror that shows users their financial data clearly, instantly, in Hebrew, with zero conflicts of interest.

### Target Users
- **Primary UX:** "The Confused Saver" — ages 25-45, multiple products, doesn't understand what they have
- **Data Depth:** "The Optimizer" — financially literate, wants to see every detail
- **Future B2B:** Insurance agents wanting a clean client presentation tool

---

## 2. Competitive Positioning

| Dimension | Cover | FINQ | InsuranceViewer |
|-----------|-------|------|-----------------|
| Data access | API (3-day wait) | API (3-day wait) | **File upload (instant)** |
| User accounts | Required | Required | **None** |
| Data storage | Cloud | Cloud | **None (browser only)** |
| Revenue model | Commission | Subscription | **TBD (no conflict)** |
| Recommendations | Yes (biased) | Yes (AI black box) | **No (pure visualization)** |
| Privacy | Shares credentials | Shares credentials | **Max privacy** |

---

## 3. Data Sources & Structure

### 3.1 Mislaka XML Files (.DAT)

All files share a common XML envelope from the Pension Clearinghouse (SwiftNess):

```xml
<Mimshak>
  <KoteretKovetz>  <!-- File header: sender, date, version -->
  <YeshutYatzran>  <!-- Insurance company info + contact -->
    <YeshutMetafel>  <!-- Administrator info -->
    <Mutzarim>       <!-- Products list -->
      <Mutzar>       <!-- Individual product -->
```

#### INP — Insurance Products (ביטוח)
- **SUG-MUTZAR:** 6
- **Key Fields:**
  - `MISPAR-POLISA-O-HESHBON` — Policy number
  - `TAARICH-HITZTARFUT-MUTZAR` — Join date
  - `STATUS-POLISA-O-CHESHBON` — Policy status
  - `ACHUZ-HAFRASHA` — Contribution percentage
  - `SCHUM-HAFKADA-SHESHULAM` — Monthly deposit amounts
  - `ACHUZ-TAT-SHNATIYOT` — Sub-annual rate
  - `TAARICH-HAFKADA-ACHARON` — Last deposit date
- **Sample Provider:** הפניקס חברה לביטוח בע"מ (Phoenix Insurance)
- **Sample Data:** Policy 1194256093, joined 2022-09-22, 100% contribution, monthly ~82-113 NIS

#### KGM — Savings Funds (קופות גמל / קרנות השתלמות)
- **SUG-MUTZAR:** 4
- **Key Fields:**
  - `MISPAR-POLISA-O-HESHBON` — Account number (e.g., 033-258-247839-0)
  - `SHEM-MASLUL-HASHKAA` — Investment track name
  - `SCHUM-TZVIRA-BAMASLUL` — Balance in track (NIS)
  - `TSUA-NETO` — Net return percentage
  - `SHEUR-TSUA-NETO` — Net return rate
  - `ACHUZ-HAFRASHA` — Contribution percentage (employer/employee split)
  - `SHEUR-DMEI-NIHUL-HAFKADA` — Deposit management fee rate
  - `SHEUR-DMEI-NIHUL-HISACHON` — Savings management fee rate
  - `KOD-SUG-MASLUL` — Track type code
- **Sample Provider:** מיטב גמל ופנסיה בע"מ (Meitav Gemel)
- **Sample Employer:** י.ל.ב.א. שרותי ניהול בעמ (Tel Aviv)
- **Sample Investment Tracks:**
  - מיטב השתלמות מניות — 9,225.48 NIS (5.45% return)
  - מיטב השתלמות כללי — 1,902.40 NIS (2.79% return)
  - מיטב השתלמות אשראי ואג"ח — 2,082.66 NIS (0.79% return)

#### PNN — Pension (פנסיה)
- **SUG-MUTZAR:** 2
- **Key Fields:**
  - `SUG-KEREN-PENSIA` — Pension fund type
  - `PENSIA-VATIKA-O-HADASHA` — Old vs new pension (2=new)
  - `SHEM-MASLUL-HABITUAH` — Insurance track name
  - `SCHUM-KITZVAT-ZIKNA` — Projected monthly old-age pension (NIS)
  - `ACHUZ-TSUA-BATACHAZIT` — Projected return percentage
  - `TOTAL-SCHUM-MTZBR-TZAFUY-LEGIL-PRISHA-MECHUSHAV-LEKITZBA-IM-PREMIYOT` — Total projected accumulation at retirement
  - `MASLUL-BITUACH-BAKEREN-PENSIA` — Insurance track in pension fund
- **Sample Provider:** אלטשולר שחם פנסיה מקיפה (Altshuler Shaham)
- **Sample Employers:** קוליירס אינטרנשיונל ישראל, פתאל וורקספייס
- **Sample Data:** Track "מסלול 100", projected pension 1,471-2,154 NIS/month, projected total 322K-421K NIS, return 4.07%

### 3.2 Har Habituach Excel (.xlsx)
- Source: הר הביטוח government portal
- Contains: All active insurance policies from government records
- Format: Standard Excel with columns for policy details

---

## 4. Functional Requirements

### 4.1 Screen Definitions

#### Screen 1: Landing / Upload Page (דף נחיתה)
**Purpose:** Explain the app and accept file uploads

**Elements:**
- App name and tagline in Hebrew
- Trust messaging: "המידע שלך לא נשמר, לא נשלח לשום מקום. הכל קורה בדפדפן שלך."
- Drag-and-drop upload zone
- File type indicators: accepts .DAT (מסלקה) and .xlsx (הר הביטוח)
- Brief guide: "איך להוריד את הקבצים?" (How to download your files) with links to Mislaka and Har Habituach
- No login, no sign-up, no registration

#### Screen 2: Unified Dashboard (לוח בקרה)
**Purpose:** High-level financial overview across all uploaded data

**Summary Cards:**
- Total pension projected monthly payment (from PNN: SCHUM-KITZVAT-ZIKNA)
- Total savings fund balances (from KGM: sum of SCHUM-TZVIRA-BAMASLUL)
- Number of insurance products (from INP: count of Mutzar elements)
- Number of providers involved (unique SHEM-YATZRAN across all files)
- Number of employers found (unique SHEM-MAASIK)

**Navigation:**
- Click-through cards to drill-down views
- Tab/section navigation: ביטוח | קופות גמל | פנסיה | הר הביטוח

#### Screen 3: Insurance Products Detail (ביטוח — INP)
**Purpose:** Show all insurance products from INP file

**Layout:** Cards or table grouped by provider (SHEM-YATZRAN)

**Per Product:**
- Provider name and logo placeholder
- Policy number (MISPAR-POLISA-O-HESHBON)
- Policy status (STATUS-POLISA-O-CHESHBON)
- Join date (TAARICH-HITZTARFUT-MUTZAR)
- Contribution rate (ACHUZ-HAFRASHA)
- Monthly deposit amount (SCHUM-HAFKADA-SHESHULAM)
- Last deposit date (TAARICH-HAFKADA-ACHARON)
- Deposit history (list of TAARICH-ERECH-HAFKADA + amounts)

#### Screen 4: Savings Funds Detail (קופות גמל — KGM)
**Purpose:** Show all savings/education funds from KGM file

**Layout:** Cards grouped by fund, with investment track breakdown

**Per Fund:**
- Provider name (SHEM-YATZRAN)
- Account number (MISPAR-POLISA-O-HESHBON)
- Employer name (SHEM-MAASIK)
- Employer address
- Contribution split (employee % + employer %)

**Per Investment Track (within fund):**
- Track name (SHEM-MASLUL-HASHKAA) — e.g., "מיטב השתלמות מניות"
- Balance (SCHUM-TZVIRA-BAMASLUL) — e.g., 9,225.48 NIS
- Net return (TSUA-NETO) — e.g., 5.45%
- Management fees (SHEUR-DMEI-NIHUL-HAFKADA, SHEUR-DMEI-NIHUL-HISACHON)

#### Screen 5: Pension Detail (פנסיה — PNN)
**Purpose:** Show pension fund details and retirement projections

**Layout:** Cards grouped by employer (SHEM-MAASIK)

**Per Pension Fund:**
- Provider name (SHEM-YATZRAN) — e.g., אלטשולר שחם פנסיה מקיפה
- Pension type: Old/New (PENSIA-VATIKA-O-HADASHA)
- Insurance track (SHEM-MASLUL-HABITUAH) — e.g., "מסלול 100"
- Employer name and address

**Retirement Projections Table:**
- Projected monthly pension (SCHUM-KITZVAT-ZIKNA) — e.g., 1,471-2,154 NIS
- Projected total at retirement (TOTAL-SCHUM-MTZBR-TZAFUY...) — e.g., 322K-421K NIS
- Projected return rate (ACHUZ-TSUA-BATACHAZIT) — e.g., 4.07%
- Multiple projection scenarios shown as rows

#### Screen 6: Har Habituach View (הר הביטוח)
**Purpose:** Display Insurance Mountain data from Excel

**Layout:** Data table with all columns from the Excel file
- Sortable columns
- Search/filter functionality
- Clean Hebrew table rendering

#### Screen 7: File Upload Status (סטטוס קבצים)
**Purpose:** Show what files were uploaded and parsed successfully

**Per File:**
- File name
- File type recognized (INP/KGM/PNN/HarBabituach)
- Number of products/records found
- Provider names detected
- Parsing status (success/error/partial)

---

## 5. Non-Functional Requirements

### Privacy
- **ZERO server-side data storage** — all parsing happens client-side in the browser
- **No accounts, no authentication, no credentials**
- Data lives only in browser memory during session
- Page refresh/close = data gone
- No analytics on financial data content
- Trust badge/messaging prominent on every screen

### Language & Locale
- **Hebrew only** — all UI text, labels, headings in Hebrew
- **Full RTL layout** — right-to-left throughout
- Date format: DD/MM/YYYY (Israeli standard)
- Currency: NIS (₪)
- Number format: Israeli conventions

### Tech Stack (for future implementation)
- **Next.js** — SSG for landing pages, client-side for app
- **Client-side XML parsing** — DOMParser or fast-xml-parser
- **Client-side Excel parsing** — SheetJS (xlsx library)
- **No backend** for MVP — static hosting only
- **RTL CSS** — dir="rtl" throughout

### Design Principles
- Clean, trustworthy aesthetic — government tool, not flashy fintech
- Mobile-responsive but desktop-first for MVP
- Accessible colors for financial data
- No recommendation CTAs — pure data display
- Minimal cognitive load — the Confused Saver should understand immediately

---

## 6. Out of Scope (MVP)

- User accounts / authentication
- Server-side data storage
- API integration with Mislaka/Har Habituach
- Financial recommendations or comparisons
- AI analysis
- Multi-language support
- Push notifications
- Historical data tracking
- Data export (PDF/CSV)
- Mobile native apps

---

## 7. Success Metrics (Post-Launch)

- Files successfully parsed without errors
- Time from upload to dashboard render < 3 seconds
- User session duration (engagement with drill-down views)
- Return visitors (re-uploading updated files)
- Qualitative: user feedback on clarity and trust

---

## 8. Open Questions

1. **Monetization strategy** — TBD after user validation
2. **Har Habituach Excel column mapping** — Need to verify exact columns from sample
3. **SUG-MUTZAR code table** — Full mapping of product type codes to Hebrew labels needed
4. **STATUS codes** — Full mapping of status codes (policy active/inactive/etc.)
5. **Multiple files per type** — Can a user have multiple INP files from different providers? (Yes — each provider sends separate file)
