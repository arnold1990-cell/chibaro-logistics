# Chibaro Logistics implementation plan

## Inspection (2026-10-25)
The repository contains README.md and .gitignore only. No frontend, backend, routes, database, authentication, tests, CI, environment settings or reusable business images exist. Git has an untracked .idea directory, which will be preserved. No AGENTS.md was found in the workspace or its parent. Java 25, Maven, Node 24 and Docker are installed. The requested screenshot is not attached; use the specified navy/orange visual direction and explicit fleet-photo placeholders.

## Architecture and priorities
1. Next.js App Router/React/TypeScript public site and Spring Boot/Java 25 REST backend. PostgreSQL is the source of truth; Flyway owns additive migrations. Same-origin /api proxy; Spring Security server sessions and CSRF, no browser credentials storage.
2. Deliver public pages and transactional quotation/customer/lead/outbox capture first. Then booking lifecycle and role-protected operations dashboard.
3. Persist campaigns, drafts, approvals and publishing jobs. Provider interfaces separate verified business context, structured AI output and publishing transport. Credentials and permissions gate integrations; never report simulated publication as success.
4. Customer assistance, leads and database-derived reporting. Finish Docker, CI, security checks and deployment documentation.

## Entities
Users with roles; business profile, services, areas, vehicles; customers, quotation requests, bookings, leads and activities; campaigns, posts, social accounts and permissions; publishing jobs/attempts; AI usage, audit logs and notification outbox. Use UUID keys, timestamps, foreign keys, unique submission keys and constrained statuses. Encrypt OAuth tokens with externally supplied AES-GCM key. Uploads require private storage, magic-byte validation and authorized download before enabling.

## API contracts
Version /api/v1. Public: GET services/service-areas/fleet; POST quotes/bookings/contact/assistant/messages. Session: GET csrf/me, POST login/logout. Admin: GET dashboard, quotes, bookings, customers, leads, business catalog, marketing/posts, campaigns, social/accounts, analytics/overview; PATCH operational resources; POST quote conversion, generation, approval and scheduling. Validate DTOs and return safe problem responses. Document actual supported contracts in OpenAPI.

## AI and publishing
OpenAI and Bedrock adapters receive only verified catalog data, never unrestricted customer records. Structured output validation, conservative claims checks, durable usage reservation and spending caps precede persistence. Draft approval is mandatory. Official Meta/LinkedIn adapters must verify OAuth state, account ownership, scopes, token validity and media eligibility. TikTok stays disabled pending approval. Durable PostgreSQL jobs use row locks, unique post/account keys, leases, exponential backoff and explicit ambiguous-outcome handling (do not blindly retry uncertain publishes). Redis supports shared rate limits and sessions.

## Verification
Backend unit and PostgreSQL integration tests: validation, transaction rollback, duplicate submission, authorization/CSRF, lifecycle transitions, capacity review, approval and publishing idempotency. Frontend typecheck/lint/build and Playwright customer/admin journeys; providers mocked and live publication disabled in tests. Docker health/startup and migration validation. Record actual results and gaps in IMPLEMENTATION_STATUS.md; do not label untested integrations operational.

## Deployment
Compose PostgreSQL/Redis/backend/frontend behind an HTTPS reverse proxy. Secrets from environment, secure admin bootstrap, private database networking, persistent volumes, health checks, daily encrypted database backups with restore drills. Validate migrations against a restored backup before rollout. Roll back application images only when schema-compatible; never automatically reverse data migrations. External credentials and actual truck photographs are business-supplied prerequisites, not fabricated defaults.
