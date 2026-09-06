# Real Data Wiring & UI Fixes

The goal of this phase is to remove all placeholder content from the user interface and wire the components up to the actual backend APIs. We will also fix the UI issues in the integrations section.

## Proposed Changes

### UI & Styling Fixes

#### [MODIFY] lib/integrations/config.ts
- Update the icon URLs for all integration providers to use `simpleicons.org/white` variants (e.g. `https://cdn.simpleicons.org/googlecalendar/white`). This ensures all logos are monochromatic, solving the Zoom rendering issue and matching the aesthetic of the hero section.

### Data Wiring: Sidebar

#### [MODIFY] components/layout/Sidebar.tsx
- Update the `Sidebar` to accept the user session (either by extracting it from `next-auth/react` directly or passing it down).
- Fetch the user's `productivityScore` and `habitStreak` from the database/API to replace the hardcoded "14 DAYS" and "94/100".
- Replace "ALEX VANCE" and "USER.ALEX" with the user's actual name and email prefix from the session.

### Data Wiring: Analytics Tab

#### [MODIFY] features/analytics/AnalyticsView.tsx
- Add a `useQuery` hook to fetch data from `/api/analytics`.
- Replace the hardcoded `deepWorkData` and `productivityTrendData` with the real data fetched from the API.
- Update the KPI cards (Total Deep Work, Productivity Score, Habit Completion, etc.) to use the real values calculated by the backend.

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` to verify type safety.

### Manual Verification
- Register a new account and verify that the correct name appears in the sidebar.
- Navigate to the integrations page and verify that all logos are white/monochromatic and properly rendered.
- Navigate to the analytics tab and verify that the data loads from the API (it should be 0/empty for a new user).
