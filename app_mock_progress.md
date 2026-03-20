# Mock Page Progress

## Route
`/mock` — mobile-first page with bottom tab bar, loads real mislaka `.dat` files.

## Architecture
- **Page**: `app/src/app/mock/page.tsx` — single client component, all tabs in one file
- **Data API (DAT)**: `app/src/app/api/mock-data/route.ts` — reads `.dat` files from `app/src/app/mock/data/` (gitignored)
- **Data API (XLSX)**: `app/src/app/api/mock-data/insurance/route.ts` — reads `.xlsx` Har Habituach file, returns parsed records
- **Parsing**: `app/src/lib/parsers.ts` — `parseXMLFile()` returns typed `ParsedKGM | ParsedPNN | ParsedINP`

## Tabs (bottom nav, RTL order)
| Tab | Status | Content |
|-----|--------|---------|
| בית (Home) | Placeholder | Icon only |
| חסכונות (Savings) | **Done** | Donut chart + legend table |
| ביטוחים (Insurance) | **Done** | Category cards grid from Har Habituach |
| המלצות (Recommendations) | Placeholder | Icon only |

Default active tab: **חסכונות**

## Savings Tab Details
- SVG donut chart with center total (₪)
- Segments grouped by product type: קופת גמל, קרן השתלמות, קרן פנסיה חדשה מקיפה/כללית
- Colors: blue (largest), red (2nd), yellow shades (rest) — assigned after sort
- Legend: borderless table, RTL (dot+label right, amount+% left)
- Data: KGM → totalBalance per product, PNN → sum of investment track balances

## Insurance Tab Details
- Header: "הביטוחים שלך" + total monthly premium + "לכל הביטוחים" back link
- 2-column grid of insurance category cards
- Each card: circle icon (blue-50 bg) + type label + monthly price badge
- Data source: Har Habituach `.xlsx` file parsed server-side via XLSX library
- Groups by `ענף ראשי` column, normalizes annual premiums to monthly (÷12)
- Merges "אבדן כושר עבודה" into "ביטוח חיים"
- Icons: Car, House, LifeBuoy, ShieldCheck, HeartPulse (from lucide-react)

## Key Fixes Applied
- **KGM parser bug**: tracks nested in `PirteiTaktziv` weren't found — added fallback traversal
- **RTL layout**: flex child order corrected (first child = rightmost in RTL)
- **Color assignment**: moved to post-sort so largest segment always gets blue
- **Duplicate keys**: used index prefix for React keys on same-label segments

## Constraints
- Hebrew only, full RTL (`dir="rtl"` on `<html>`)
- Mobile-first: `min-h-dvh`, `env(safe-area-inset-bottom)`, fixed bottom nav
- Mock data files are personal — gitignored at `app/src/app/mock/data/`
