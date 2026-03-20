# Story 1.2: Create Data Model, Zod Schemas & State Management

Status: in-progress

## Story

As a developer,
I want the TypeScript data model, Zod validation schemas, and React Context state management in place,
So that parsed file data can be stored and consumed consistently across all components.

## Acceptance Criteria

1. TypeScript interfaces exist for ParsedPortfolio, FinancialProduct (discriminated unions), Provider, Employer, FileMetadata
2. Zod schemas validate parsed data with graceful handling (warnings, not throwing)
3. PortfolioContext with useReducer supports PARSE_START, PARSE_SUCCESS, PARSE_ERROR, ADD_FILES, RESET
4. Consumer hooks usePortfolio(), useProducts(type), useKPIs() derive computed values
5. Centralized Hebrew strings at src/lib/strings/he.ts
6. All have co-located unit tests passing

## Tasks / Subtasks

- [ ] Task 1: Create Zod schemas for all data types
- [ ] Task 2: Refactor context to useReducer with typed actions
- [ ] Task 3: Create consumer hooks
- [ ] Task 4: Create centralized Hebrew strings
- [ ] Task 5: Add unit tests
- [ ] Task 6: Validate build and tests pass

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List

### File List
