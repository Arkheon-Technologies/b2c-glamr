# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- API auth workspace test setup with Jest configuration and auth service unit tests.
- Queue service unit tests covering list/join/status/reindex behavior.
- API route-level integration tests for auth, booking, queue, and portfolio contracts.
- Project implementation tracker document at docs/STATUS.md.
- Password recovery web routes:
	- /auth/forgot-password
	- /auth/reset-password
- Booking MVP API endpoints:
	- GET /businesses/discover
	- GET /services
	- GET /services/:id
	- GET /scheduling/availability
	- POST /bookings
	- POST /bookings/:id/cancel
- Booking MVP web routes:
	- /book (service catalog)
	- /book/[serviceId] (live availability and booking submit)
- Queue MVP API endpoints:
	- GET /queue
	- POST /queue/join
	- POST /queue/:entryId/status
- Queue MVP web routes:
	- /queue (walk-in join and queue list)
	- /studio/queue (studio operations console)
- Portfolio MVP API endpoint:
	- GET /portfolio
- Portfolio workflow API endpoints:
	- POST /portfolio
	- POST /portfolio/:id/publish
	- POST /portfolio/:id/book-tap
	- POST /portfolio/uploads/presign
- Portfolio MVP web route:
	- /portfolio (published results gallery)
- Portfolio studio web route:
	- /studio/portfolio (create and publish management console)

### Changed
- API workspace now includes `test:integration` for targeted integration suite execution.
- Web auth pages now call live API endpoints for register and login instead of simulated delays.
- Web auth flow now persists user/session payload locally and redirects to explore on success.
- Auth controller now validates request payloads via DTO classes and class-validator rules.
- Navbar and explore CTA links now route users into the live booking flow.
- Navbar now includes queue entry points for customer and studio queue workflows.
- Navbar and footer now include portfolio gallery entry points.
- Explore page now renders live service discovery data with search and vertical filtering.
- Auth service now supports password reset token issuance and secure token consumption.
- Auth service now attempts SendGrid password reset email delivery with safe fallback logging when provider setup is missing or fails.
- Portfolio gallery booking CTA now tracks per-item booking tap attribution before routing to booking.
- Portfolio create endpoint now requires JWT authentication with business owner or active staff membership checks.
- Portfolio publish endpoint now requires business owner or manager-role staff authorization, including create-time publish guardrails.
- Studio portfolio web actions now forward persisted bearer tokens on protected portfolio write requests.
- Studio portfolio creation now uploads selected media files via presigned S3 URLs before persisting portfolio items.

### Security
- Refresh tokens are now stored as hashed values in persistence.
- Refresh and logout now support both hashed and legacy plain-token rows during transition.
- Password reset tokens are now hashed, single-use, and expiry-bound.
- Successful password reset revokes active refresh sessions.