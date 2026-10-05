# Enewari Digital Mesob V12

Enewari City Administration bilingual public portal + admin dashboard.

## V12 highlights
- Citizen account registration/login using phone + password.
- Citizen dashboard for submitted requests, request timelines and in-app notifications.
- Citizen profile and password management.
- Logged-in citizens have their name/phone/kebele prefilled in online service requests; submitted requests can be linked to the account.
- Guest service requests remain supported and can still be tracked by reference number + phone.
- Status-change notifications are stored against the citizen account when available.

## V11 highlights
- Online citizen service requests with unique reference numbers.
- Automatic first assignment to the relevant office for water, tax, traffic, trade, land, complaints and general requests.
- Admin can reassign an application, set priority (Low/Normal/High/Urgent), due date and status.
- Request history/timeline is stored and visible to the citizen when they verify reference number + phone.
- Admin dashboard statistics: total, new, in progress, completed, rejected, and requests by office.
- In-app notification queue is recorded when a request status changes. Real SMS/email delivery requires an approved provider and credentials.
- Existing bilingual public site, 12 institutions, news, documents, AI assistant, PWA, security, backups and admin-managed city information remain included.

## Run
```bash
npm install
cp .env.example .env
npm run init-db
npm start
```

Public: http://localhost:3000
Admin: http://localhost:3000/admin

Demo admin (change immediately):
- Email: admin@enewari.gov.et
- Password: ChangeMe123!

## Production notes
- Set a strong JWT_SECRET and admin password.
- Use HTTPS and secure cookies.
- Configure real SMS/email provider only after the administration has approved the provider and message templates.
- Connect official water, revenue/tax and traffic databases/APIs before presenting any personal account balance or fine data.
- Add backups, malware scanning, file-size/type validation, monitoring, and rate limiting at the deployment layer as appropriate.

## V13 — Staff accounts, roles & permissions

Admin can now create staff accounts and assign roles:
- `superadmin` — system owner (seeded admin)
- `admin` — administration management
- `editor` — news/content management
- `office_staff` — handles requests assigned to one institution
- `viewer` — read-only access

Office staff are scoped to their assigned institution for citizen service requests. Admin/editor permissions are enforced server-side, not only in the UI.

The first admin remains the `.env` `ADMIN_EMAIL` / `ADMIN_PASSWORD` account. Change the demo password immediately in production.


## V18 additions
- Citizen service requests accept up to 5 supporting files (10 MB each).
- Request documents are stored in `service_request_documents` and visible to authorized staff.
- Payment tracking table and gateway-ready Chapa initialization/webhook are included. Fees remain 0 until official fees are configured; no fake payment is reported as completed.
- Optional environment variables: `PAYMENT_PROVIDER=chapa`, `CHAPA_SECRET_KEY`, `PAYMENT_CALLBACK_URL`, `PAYMENT_RETURN_URL`, `PAYMENT_WEBHOOK_SECRET`, `PAYMENT_CURRENCY=ETB`, `MAX_REQUEST_FILE_MB=10`.

## V18 — Dynamic Service Catalog
- Services are now managed from Admin via `office_services`.
- Each service can define institution, bilingual name/description, official fee, currency, estimated completion days, required documents, and JSON form fields.
- Public online application forms are generated from the service definition.
- Required dynamic fields are validated on submission and saved as structured `form_data`.
- Required-document rules are enforced at upload level when configured.
- Application due dates are calculated from the configured estimated days.
- Payment records now use the configured service fee instead of a hardcoded catalog.
- Admin can activate/deactivate services without changing source code.
- Existing seeded fees remain 0 until the administration confirms official fees.

## V18 — Workflow Engine
- Each service can define a bilingual workflow with ordered steps, status mapping, responsible role, and terminal step.
- New applications save a workflow snapshot so later service edits do not rewrite existing applications.
- Admin/office staff can move a request through its configured workflow and add a transition note.
- Workflow transition logs are stored separately and visible from the request detail view.
- Citizen in-app notifications are created when a workflow transition changes the application status.
- If a service has no workflow, the normal status controls remain available.

Example workflow: ሰነድ ማረጋገጥ → ባለሙያ ሂደት → ኃላፊ ማጽደቅ → ማጠናቀቅ.


## V18 — Citizen Portal 2.0
- Expanded citizen application detail dashboard.
- Workflow progress visualization and workflow history.
- Attached document listing.
- Payment status and payment initiation from the citizen portal.
- Submitted dynamic form data visible to the citizen.
- Application summary with office, priority and due date.
- Payment success is never faked; provider/webhook configuration is required.


## V22 additions
- Citizen satisfaction feedback for completed service requests (1–5 rating + comment).
- Feedback is verified using reference number + phone and limited to completed requests.
- Admin feedback dashboard with average rating, 5-star count, low-rating count and recent comments.

## V25 — Digital Certificate & Verification
- Admin can issue official certificate records linked to a service request.
- Each certificate receives a unique certificate number and verification code.
- Public `/verify.html` verifies a code without requiring login.
- QR codes point to the public verification page.
- Certificates can be marked Valid or Revoked; optional expiry dates are supported.
- For production, certificate templates, official signatures/seals, legal retention rules, and authorized issuer roles should be configured by the administration.


## V25 — Official Document Generator
- Added print-ready `certificate.html` for official certificate layout.
- Admin Certificates now includes Print and QR actions.
- Browser print can save the certificate as PDF without a server-side PDF dependency.
- Added QR Code dependency (`qrcode`) required by certificate verification/QR endpoints.
- Official seal/signature areas are placeholders and must be configured/approved before production use.


## V25 — Admin-first official information
The public site no longer requires unverified city-profile facts to be hardcoded. Superadmin/admin can fill or update city profile, mayor/head name, population, area, kebele count, elevation, coordinates, mission, vision, source name/URL, footer links/text, contact details and certificate organization/signatory information from **Admin → የከተማ መረጃ** after the site starts. Blank fields remain blank on the public profile instead of showing invented values. Institutions, services, news, documents and fees are already managed from Admin.
