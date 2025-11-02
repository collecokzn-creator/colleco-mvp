# Request: Siteminder sandbox & technical integration details

Use this copy-ready message to request sandbox access, API specifications, and pricing details from Siteminder (or forward to your Siteminder account manager). Replace bracketed placeholders before sending.

Subject: Request — Siteminder API sandbox & technical details for Beekman Holidays

Hello [Siteminder Technical Contact / Support],

We are Beekman Holidays ([your company], contact below). We're preparing to integrate our Channel Management and booking flows with Siteminder and would like to request sandbox access and the technical documentation required to scope development and costs.

Requested items (sandbox/test environment preferred):

1) API specification (OpenAPI/Swagger preferred) and example payloads for:
   - Create booking
   - Update booking
   - Cancel booking
   - Availability check
   - Rate push (rate plans / inventory)
   - Endpoints for property metadata, room types and rate plans

2) Sandbox access:
   - Sandbox base URL and test account credentials (or instructions to create a sandbox account)
   - Example property/merchant IDs to use in tests

3) Authentication & Authorization:
   - Supported auth methods (API key, OAuth2 client credentials, JWT)
   - Token lifetimes and recommended refresh approach
   - Example auth flows for obtaining tokens

4) Webhooks / callbacks:
   - Supported webhook event types and payload examples (booking.created, booking.updated, booking.cancelled, rate.update, availability.change)
   - Recommended verification method for incoming webhooks (HMAC secret, signature header)

5) Rate limits, quotas & IP allowlist:
   - Per-second/minute rate limits and burst policies
   - IP ranges to allowlist (if needed) for inbound/outbound callbacks

6) Error formats & codes:
   - Standard error response shape and recommended retry semantics for 429/500

7) Sandbox test data & fixtures:
   - Example room types, rate plans, and sample booking payloads we can use for verification

8) Integration support & contacts:
   - Technical contact for engineering questions (name, email, phone)
   - Recommended integration partners or certified connectors (if available)

9) Commercial info (high level):
   - Any licensing or per-booking costs, or required certification steps to go live

We plan to implement a mock-first connector and run unit + Cypress tests against a local mock server. Our flow will be: sandbox -> staging -> production. Please advise any additional steps needed from your side to enable sandbox testing for Beekman Holidays.

Thanks,
[Your name]
[Your role], Beekman Holidays
[Email] | [Phone]
