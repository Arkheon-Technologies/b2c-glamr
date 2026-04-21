# GLAMR Implementation Status

> Last updated: 2026-04-18

This document tracks implementation progress against the MVP scope in the PRD.

## Overall Snapshot

- Architecture and domain modeling: strong foundation in place.
- Authentication: frontend and backend baseline now connected and validated.
- Discovery, booking, queue, and portfolio now have live API and web delivery slices; deeper workflows remain in progress.

## MVP Progress Matrix

| Domain | Status | Completion | Notes |
|---|---|---:|---|
| Auth (register/login/refresh/logout) | In progress | 96% | Register/login/refresh/logout live, forgot/reset token lifecycle implemented, dedicated recovery pages added, and SendGrid reset delivery path integrated with graceful fallback logging. |
| Discovery (explore marketplace) | In progress | 65% | Explore page now uses live services API with search and vertical filters. |
| Scheduling engine | In progress | 45% | Availability endpoint now returns service/staff slots with overlap checks and split-phase metadata. |
| Booking lifecycle | In progress | 50% | Booking create and cancel endpoints implemented with overlap checks and phase creation. |
| Walk-in queue | In progress | 55% | Queue list/join/status APIs are live; customer and studio queue management pages are implemented. |
| Portfolio | In progress | 68% | Listing/create/publish/book-tap portfolio APIs are live with owner-staff write auth, manager-gated publishing, and S3 presigned media upload flow. |
| Payments and deposits | Not started | 5% | Stripe keys/env placeholders exist; no runtime payment flow yet. |
| Compliance forms and consent | Not started | 10% | Models are in schema; no functional intake/consent UI or endpoints. |
| Testing infrastructure | In progress | 66% | API unit + integration coverage now validates auth/booking/queue/portfolio contracts including role-based publish permissions and upload auth guards; broader web end-to-end coverage is still pending. |

## Recently Completed

- Web auth form integration:
  - Login form wired to API and session persistence.
  - Register form wired to API with inline error handling.
- Backend auth hardening:
  - DTO validation for all auth routes.
  - Refresh token storage moved to hashed token values.
  - Backward-compatible support for legacy plain refresh tokens.
- Password recovery implementation:
  - Added password reset token persistence model in Prisma schema.
  - Forgot-password now creates expiry-bound, single-use reset tokens.
  - Reset-password now validates token, updates password, and revokes active refresh sessions.
  - Added web pages at /auth/forgot-password and /auth/reset-password.
  - Added SendGrid-based password reset delivery path with fallback logging when provider/env is unavailable.
- API unit testing:
  - Added Jest setup in API workspace.
  - Added auth service tests for register/login/refresh/logout and password recovery paths.
  - Added queue service tests for list/join/status and reindex behavior.
- API integration testing:
  - Added route-level integration suite for auth, booking, queue, and portfolio endpoints.
  - Added dedicated script `test:integration` for targeted contract validation runs.
- Portfolio MVP delivery:
  - Added live published portfolio listing endpoint at GET /portfolio.
  - Added live gallery surface at /portfolio with search and vertical filtering.
  - Added navigation entry points to the portfolio gallery in web layout components.
- Portfolio workflow expansion:
  - Added studio portfolio management route at /studio/portfolio for draft creation and publish-state controls.
  - Added portfolio API endpoints for create, publish toggle, and booking-tap attribution tracking.
  - Enforced JWT-authenticated owner/staff access controls for portfolio draft creation.
  - Enforced owner-or-manager role checks for publish and unpublish actions, including create-time publish bypass prevention.
  - Added authenticated upload intent endpoint at POST /portfolio/uploads/presign for presigned S3 media uploads.
  - Replaced manual studio portfolio URL entry with file-based direct uploads before item creation.
  - Extended integration tests to validate portfolio create/publish/book-tap contract behavior.
- MVP booking vertical API delivery:
  - GET /businesses/discover
  - GET /services
  - GET /services/:id
  - GET /scheduling/availability
  - POST /bookings
  - POST /bookings/:id/cancel
- MVP booking web delivery:
  - Added live service catalog page at /book.
  - Added service booking page at /book/[serviceId] with slot selection and booking submit.
  - Updated navigation and explore CTA links into booking flow.
- Live explore delivery:
  - Replaced placeholder artist grid with live service discovery from API.
  - Added search and vertical filter interactions on /explore.
- Queue vertical delivery:
  - Added queue endpoints for listing, joining, and status transitions.
  - Added customer queue page at /queue for walk-in join and live list refresh.
  - Added studio queue console at /studio/queue for operations status updates.

## Next 3 Priorities

1. Add queue and booking end-to-end web tests:
   - Validate primary customer journey from discovery to booking and walk-in queue join.
2. Add portfolio post-upload media processing:
  - Implement thumbnail generation, watermark transforms, and asynchronous processing status tracking.
3. Expand auth email delivery verification in non-dev environments:
   - Confirm SendGrid configuration and staging reset-link delivery telemetry.

## Weekly Update Checklist

- Update completion percentages for each domain.
- Record newly shipped endpoints and web routes.
- Record test coverage changes.
- Move delivered items from priorities into "Recently Completed".