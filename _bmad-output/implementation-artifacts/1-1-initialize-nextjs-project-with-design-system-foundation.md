# Story 1.1: Initialize Next.js Project with Design System Foundation

Status: review

## Story

As a developer,
I want a properly configured Next.js project with TypeScript, Tailwind, shadcn/ui, and all dependencies,
So that I have a solid foundation to build all features on.

## Acceptance Criteria

1. **Given** a fresh project directory **When** the initialization commands are run **Then** a Next.js App Router project exists with TypeScript strict mode enabled
2. **Given** the project is initialized **When** I inspect the root layout **Then** `<html lang="he" dir="rtl">` is set and Assistant + Heebo Google Fonts are configured via `next/font`
3. **Given** the project is initialized **When** I inspect Tailwind config **Then** RTL logical properties are available (`ps-`, `pe-`, `ms-`, `me-`) and design tokens are configured (navy `#1e3a5f`, teal `#0d9488`, background `#fafafa`, card `#ffffff`)
4. **Given** shadcn/ui is initialized **When** I check `components.json` **Then** the shadcn theme uses InsuranceViewer design tokens as CSS variables (`--primary`, `--secondary`, etc.)
5. **Given** dependencies are installed **When** I check `package.json` **Then** `recharts`, `xlsx`, and `zod` are listed as dependencies
6. **Given** Vitest is configured **When** I run `pnpm test` **Then** Vitest runs and discovers co-located `*.test.ts` / `*.test.tsx` files
7. **Given** the project is initialized **When** I check `tsconfig.json` **Then** `@/*` import alias maps to `src/*`
8. **Given** the project is initialized **When** I check `next.config.ts` **Then** CSP headers are configured to prevent XSS (script-src 'self', style-src 'self' 'unsafe-inline')
9. **Given** all setup is complete **When** I run `pnpm build && pnpm dev` **Then** the project builds and starts without errors

## Tasks / Subtasks

- [x] Task 1: Scaffold Next.js project (AC: #1, #7)
  - [x] Run `pnpm create next-app@latest insurance-viewer --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*"`
  - [x] Verify TypeScript strict mode in `tsconfig.json` (`"strict": true`)
  - [x] Verify `@/*` alias resolves to `./src/*` in `tsconfig.json` paths
- [x] Task 2: Initialize shadcn/ui with design tokens (AC: #3, #4)
  - [x] Run `npx shadcn@latest init`
  - [x] Update `globals.css` with InsuranceViewer CSS variables:
    - `--primary` → navy `#1e3a5f` (oklch: 0.306 0.058 253)
    - `--secondary` → teal `#0d9488` (oklch: 0.557 0.099 175)
    - `--background` → `#fafafa` (oklch: 0.985 0 0)
    - `--card` → `#ffffff` (oklch: 1 0 0)
    - Semantic status colors: `--healthy` (emerald), `--attention` (amber), `--missing` (amber), `--info` (blue)
  - [x] Configure `tailwind.config.ts` to extend theme with design tokens
- [x] Task 3: Configure RTL and Hebrew fonts (AC: #2)
  - [x] Configure Assistant (headings, 600/700 weight) and Heebo (body/numbers, 400/500/700) via `next/font/google` in `layout.tsx`
  - [x] Set `<html lang="he" dir="rtl">` in root `layout.tsx`
  - [x] Add `font-variant-numeric: tabular-nums` utility class in Tailwind config
- [x] Task 4: Install project dependencies (AC: #5)
  - [x] Run `pnpm add recharts xlsx zod`
  - [x] Verify all three appear in `package.json` dependencies
- [x] Task 5: Configure Vitest (AC: #6)
  - [x] Run `pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom`
  - [x] Create `vitest.config.ts` with:
    - React plugin
    - `jsdom` environment
    - Path alias `@/*` → `src/*`
    - Include pattern: `src/**/*.test.{ts,tsx}`
  - [x] Add `"test": "vitest"` and `"test:run": "vitest run"` scripts to `package.json`
  - [x] Create a smoke test `src/app/layout.test.tsx` that verifies the layout renders
- [x] Task 6: Configure CSP headers (AC: #8)
  - [x] Add `headers()` config in `next.config.ts` with:
    - `Content-Security-Policy`: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';`
    - No `eval()`, no external scripts
- [x] Task 7: Create placeholder directory structure (AC: #1)
  - [x] Create empty directories matching architecture:
    - `src/components/ui/` (shadcn already creates this)
    - `src/components/dashboard/`
    - `src/components/agent/`
    - `src/components/charts/`
    - `src/components/layout/`
    - `src/lib/parsers/`
    - `src/lib/types/`
    - `src/lib/schemas/`
    - `src/lib/context/`
    - `src/lib/hooks/`
    - `src/lib/strings/`
    - `src/lib/utils/`
  - [x] Add `.gitkeep` to empty directories
- [x] Task 8: Validate build (AC: #9)
  - [x] Run `pnpm build` — must succeed
  - [x] Run `pnpm dev` — must start without errors
  - [x] Run `pnpm test:run` — smoke test must pass

## Dev Notes

### Architecture & Stack

- **Package manager:** pnpm (not npm/yarn)
- **Next.js App Router** with `src/` directory structure
- **TypeScript strict mode** — no `any`, no implicit returns
- **Tailwind CSS** with logical RTL properties (`ps-`, `pe-`, `ms-`, `me-` instead of `pl-`, `pr-`, `ml-`, `mr-`)
- **shadcn/ui** for component library — uses CSS variables for theming
- **Turbopack** for dev server HMR

### Initialization Command (from Architecture)

```bash
pnpm create next-app@latest insurance-viewer --typescript --tailwind --eslint --app --src-dir --turbopack --import-alias "@/*"
cd insurance-viewer
npx shadcn@latest init
pnpm add recharts xlsx zod
```

### Design Token Values (from UX Spec)

| Token | Hex | Usage |
|-------|-----|-------|
| Navy | `#1e3a5f` | Primary, headings, nav |
| Teal | `#0d9488` | Secondary, accents, links |
| Background | `#fafafa` | Page background |
| Card | `#ffffff` | Card backgrounds |
| Healthy | `emerald-500/5` bg, `emerald-500/10` border | Positive status |
| Attention | `amber-500/10` border | Warning status |
| Missing | `amber-500` | Missing coverage |
| Info | `blue-500` | Informational |

### Font Configuration

- **Assistant** (Google Font): Headings, weight 600/700
- **Heebo** (Google Font): Body text and numbers, weight 400/500/700
- Apply `font-variant-numeric: tabular-nums` for aligned number columns

### CSP Header Notes

- No external API calls — `default-src 'self'` is sufficient
- `'unsafe-inline'` needed for `style-src` because Next.js injects inline styles
- No `'unsafe-eval'` ever — this is a security requirement (NFR15)
- `data:` for `img-src` in case of inline SVGs or data URLs

### Vitest Configuration

- Co-located tests: `Component.test.tsx` next to `Component.tsx`
- Test fixtures go in `__fixtures__/` directories
- Use `@testing-library/react` for component tests
- Use `jsdom` environment for DOM testing

### Anti-Patterns to Avoid

- Do NOT use `npm` or `yarn` — use `pnpm` only
- Do NOT hardcode Hebrew strings in components — they go in `src/lib/strings/he.ts` (Story 1.2)
- Do NOT use relative imports going up more than 1 level — use `@/` alias
- Do NOT create any Context providers yet — that's Story 1.2
- Do NOT create any parsers yet — those are Stories 1.4-1.7

### Project Structure Notes

- This story creates the empty directory skeleton matching the architecture doc's `src/` structure
- All directories under `src/components/` and `src/lib/` should exist but remain empty (with `.gitkeep`)
- The `src/app/page.tsx` can be a minimal placeholder — the real landing page is Story 1.3
- The `src/app/layout.tsx` must have the correct `<html>` attributes and font setup

### References

- [Source: architecture.md#Starter Template Evaluation] — init commands, package manager
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — naming, structure, test location
- [Source: architecture.md#Complete Project Directory Structure] — full directory tree
- [Source: ux-design-specification.md#UX-DR9] — design token values
- [Source: ux-design-specification.md#UX-DR10] — typography system (Assistant + Heebo fonts)
- [Source: epics.md#Story 1.1] — acceptance criteria
- [Source: architecture.md#Authentication & Security] — CSP requirements

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- Existing Next.js project found in `app/` directory — updated in place rather than scaffolding fresh
- Switched from npm (package-lock.json) to pnpm (pnpm-lock.yaml)
- shadcn/ui v4 initialized with Tailwind v4 — uses oklch color format instead of HSL
- Design tokens converted to oklch: navy → oklch(0.306 0.058 253), teal → oklch(0.557 0.099 175)
- Fonts switched from external Google Fonts link to next/font/google (Assistant + Heebo)
- Vitest required `globals: true` in config to make `vi` available globally

### Completion Notes List

- ✅ Task 1: Next.js App Router project verified — TypeScript strict mode, @/* alias confirmed
- ✅ Task 2: shadcn/ui initialized with InsuranceViewer design tokens (navy/teal/semantic colors in oklch)
- ✅ Task 3: RTL configured (lang="he" dir="rtl"), Assistant + Heebo via next/font/google, tabular-nums utility
- ✅ Task 4: recharts, xlsx, zod confirmed in package.json dependencies
- ✅ Task 5: Vitest configured with jsdom, co-located tests, @/* alias; smoke test passes
- ✅ Task 6: CSP headers configured in next.config.ts (no unsafe-eval, no external scripts)
- ✅ Task 7: Architecture directory skeleton created with .gitkeep files
- ✅ Task 8: pnpm build succeeds, pnpm test:run passes (1 test, 1 passed)

### Change Log

- 2026-03-17: Story 1.1 implementation — project foundation configured with design system

### File List

- app/package.json (modified — added pnpm scripts, recharts, zod, vitest deps)
- app/pnpm-lock.yaml (created — replaced package-lock.json)
- app/src/app/layout.tsx (modified — next/font Assistant+Heebo, removed external font link)
- app/src/app/globals.css (modified — InsuranceViewer design tokens, semantic status colors)
- app/src/app/layout.test.tsx (created — smoke test)
- app/components.json (created — shadcn/ui config)
- app/vitest.config.ts (created — Vitest configuration)
- app/vitest.setup.ts (created — test setup with jest-dom)
- app/next.config.ts (modified — CSP headers)
- app/src/components/ui/button.tsx (created — shadcn/ui button)
- app/src/lib/utils.ts (created — shadcn/ui cn utility)
- app/src/components/dashboard/.gitkeep (created)
- app/src/components/agent/.gitkeep (created)
- app/src/components/charts/.gitkeep (created)
- app/src/components/layout/.gitkeep (created)
- app/src/lib/types/.gitkeep (created)
- app/src/lib/schemas/.gitkeep (created)
- app/src/lib/context/.gitkeep (created)
- app/src/lib/hooks/.gitkeep (created)
- app/src/lib/strings/.gitkeep (created)
