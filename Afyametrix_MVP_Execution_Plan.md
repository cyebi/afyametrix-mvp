# Afyametrix MVP Execution Plan

## Assumptions
- We will build an MVP web app first, optimized for mobile frontline usage.
- We will prioritize pilot readiness over scale architecture.
- We will use SORMAS-compatible data exchange later (Phase 2+), not in Sprint 1.

## MVP Outcome (Pilot-Ready)
A CHPS worker can submit a suspected case offline, the system syncs when online, and DSNO/DHIO receive timely alerting (in-app first, SMS fallback when internet is unavailable). District officers can view a dashboard and export weekly reports.

## In-Scope MVP Features
1. Offline-first frontline case capture.
2. Sync queue with retry and conflict-safe submission.
3. Urgent alert triggering + SMS fallback payload generation.
4. District dashboard (counts, trends, completeness, alert history).
5. Threshold-based alert rules (configurable).
6. Weekly report exports (PDF + Excel).
7. Role-based access control (CHPS, DHIO, DSNO, Regional, Ministry, Donor).
8. Basic audit log and data quality indicators.

## Out of Scope (Per PRD)
1. AI prediction/forecasting.
2. EMR replacement.
3. Multi-country scale architecture.
4. Full interoperability orchestration (SORMAS/DHIS2 deep integration).

## MVP Architecture (Practical)
- Frontend: PWA for offline forms + dashboard views.
- Backend API: REST service with role-aware endpoints.
- Storage: Relational DB for cases, alerts, users, facilities, audit events.
- Queue: Lightweight background worker for sync processing and alert delivery.
- SMS adapter: Provider abstraction with pluggable gateway.
- Reporting service: Scheduled weekly summary generation + on-demand export.

## Core Data Entities
1. User (id, role, district_id, facility_id, active).
2. Facility (id, name, district_id, connectivity_profile).
3. CaseReport (id, reporter_id, case_type, severity, symptoms, location, occurred_at, submitted_at, sync_status).
4. AlertRule (id, district_id, case_type, threshold_value, threshold_window_hours, active).
5. AlertEvent (id, rule_id, case_report_id, triggered_at, delivery_channels, delivery_status).
6. SyncJob (id, device_id, payload_hash, status, retries, last_error).
7. WeeklyReport (id, district_id, week_start, generated_at, pdf_url, xlsx_url).
8. AuditLog (id, actor_id, action, entity, entity_id, timestamp, metadata_json).

## API Surface (Initial)
1. `POST /auth/login`
2. `GET /me`
3. `POST /cases`
4. `GET /cases?district=&from=&to=`
5. `POST /sync/batch`
6. `GET /dashboard/district/:districtId`
7. `POST /alerts/rules`
8. `GET /alerts/events?district=&from=&to=`
9. `POST /reports/weekly/generate`
10. `GET /reports/weekly?district=&week=`
11. `GET /audit?entity=&from=&to=`

## Sprint Plan

### Sprint 0 (Setup, 3-4 days)
1. Repo structure and CI.
2. Auth skeleton + RBAC middleware.
3. Database schema migration baseline.
4. PWA shell with offline storage bootstrap.

### Sprint 1 (Frontline + Alerts, 1 week)
1. Offline case capture form.
2. Local queue + sync endpoint.
3. Alert rule evaluator.
4. In-app alert notifications for DSNO/DHIO.
5. SMS fallback payload + provider adapter contract.

### Sprint 2 (District Ops, 1 week)
1. District dashboard widgets.
2. Reporting completeness and facility status cards.
3. Alert history timeline.
4. Weekly PDF/Excel export.

### Sprint 3 (Pilot Hardening, 1 week)
1. Audit logging coverage.
2. Data quality checks (missing required fields, duplicate suspicion flags).
3. Performance pass for dashboard response times.
4. Pilot training mode (guided walkthrough + demo dataset).

## Acceptance Criteria (MVP Gate)
1. Offline report submission works without connectivity and syncs later.
2. 90%+ configured urgent alerts are delivered and logged.
3. District dashboard loads under agreed benchmark.
4. Weekly exports generated successfully for pilot districts.
5. Core user roles can complete workflows without engineering support.

## Engineering Backlog (First 10 Tickets)
1. Create database schema for core entities.
2. Implement JWT auth and role middleware.
3. Build CHPS case form with local persistence.
4. Implement `/sync/batch` idempotent ingest endpoint.
5. Create threshold rule engine service.
6. Add alert event logging and notification service.
7. Implement SMS provider abstraction and mock adapter.
8. Build district dashboard API aggregation query.
9. Build weekly report generation pipeline (PDF/XLSX).
10. Add audit logging interceptor for write operations.

## Risks and Mitigations
1. Low-connectivity sync failures.
- Mitigation: idempotent sync, exponential retry, dead-letter review.
2. SMS cost and reliability.
- Mitigation: route only urgent events, batching, delivery tracking.
3. Training/adoption friction.
- Mitigation: minimal form UX, pilot onboarding checklist, in-app guidance.

## What We Build Next
1. Confirm stack and scaffold app modules.
2. Implement Sprint 0 baseline end-to-end.
3. Demo first offline-to-sync workflow with sample district data.
