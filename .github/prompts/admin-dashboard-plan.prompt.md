---
description: "Generate a detailed implementation plan for EzyRide Admin Dashboard — covering backend models, API routes, frontend pages, and all admin operations"
agent: "agent"
---

# EzyRide Admin Dashboard — Implementation Plan

You are planning an Admin Dashboard for the **EzyRide** ride-sharing platform. Read the full codebase context below and produce a phased, actionable implementation plan.

## Codebase Context

### Current Tech Stack
- **Frontend:** React 18, React Router v6, Styled Components, Socket.io Client, Axios/Fetch
- **Backend:** Express 5, Mongoose 8 (MongoDB), Socket.io, JWT auth, Razorpay payments, Twilio WhatsApp (SOS), TensorFlow.js face matching (KYC)
- **Auth:** JWT tokens, bcryptjs hashing, no role system yet
- **State:** React Context (AuthContext) — no Redux/global store
- **Styling:** Styled Components with theme (primary: #2b492c dark green)

### Existing Models
- **User** — fullName, phone, email, password, vehicle, vehicleType, profilePicture, kyc (status/documents/matchScore), savedSearches, safetyPaymentSettings
- **Ride** — from, to, date, seatsAvailable, pricePerSeat, postedBy, passengerIds, status (posted/ongoing/completed/cancelled)
- **Booking** — ride, user, seatsBooked, status, ride_start_code, paymentStatus (pending/succeeded/failed/refunded), razorpayOrderId/PaymentId
- **Chat** — ride, sender, message
- **Review** — reviewer, reviewee, rating, comment, bookingId
- **SOS** — user, contacts[], message

### Existing API Routes (30+ endpoints)
Auth, Rides CRUD, Bookings CRUD, Chats, Reviews, Profile, KYC upload/status, SOS, Razorpay payments, Dashboard stats, Ride status updates

### Current Gaps (No Admin Features)
- No `role` field on User model
- No admin routes or middleware
- No admin frontend pages
- No moderation, analytics, or platform management tools

---

## Requirements — Admin Dashboard Must Cover

### Phase 1: Foundation (Role System & Auth)
1. **Add `role` field** to User model — `enum: ['user', 'admin']`, default `'user'`
2. **Create `adminMiddleware.js`** — verify `req.user.role === 'admin'` after `protect` middleware
3. **Admin seed script** — create first admin user via CLI command
4. **Admin login** — separate or shared login with role-based redirect

### Phase 2: Admin API Routes (`/api/admin/*`)
Design RESTful admin endpoints for:

#### User Management
- `GET /api/admin/users` — List all users (paginated, searchable, filterable by KYC status/vehicle type)
- `GET /api/admin/users/:id` — User detail with rides, bookings, reviews
- `PATCH /api/admin/users/:id` — Edit user details, ban/activate
- `DELETE /api/admin/users/:id` — Soft-delete/deactivate user
- `PATCH /api/admin/users/:id/role` — Promote/demote user role

#### KYC Verification
- `GET /api/admin/kyc/pending` — List users with pending KYC
- `GET /api/admin/kyc/:userId` — View KYC documents (Aadhaar front/back, selfie, matchScore)
- `PATCH /api/admin/kyc/:userId` — Manually approve/reject KYC with reason

#### Ride Management
- `GET /api/admin/rides` — List all rides (paginated, filterable by status/date/route)
- `GET /api/admin/rides/:id` — Ride detail with bookings, passengers, chat
- `PATCH /api/admin/rides/:id` — Force cancel or modify ride
- `DELETE /api/admin/rides/:id` — Remove ride

#### Booking & Payment Management
- `GET /api/admin/bookings` — List all bookings (filterable by status/payment)
- `GET /api/admin/bookings/:id` — Booking detail with payment info
- `PATCH /api/admin/bookings/:id/refund` — Process manual refund via Razorpay
- `GET /api/admin/payments` — Payment transactions list with Razorpay details

#### Review & Content Moderation
- `GET /api/admin/reviews` — List all reviews (sortable by rating, flagged)
- `DELETE /api/admin/reviews/:id` — Remove inappropriate review
- `GET /api/admin/chats/:rideId` — View chat history for any ride

#### SOS & Safety
- `GET /api/admin/sos/alerts` — List triggered SOS events (new model/logging needed)
- `GET /api/admin/sos/:userId` — View user's SOS configuration

#### Analytics & Dashboard
- `GET /api/admin/analytics/overview` — Total users, rides, bookings, revenue
- `GET /api/admin/analytics/trends` — Time-series data (daily/weekly/monthly)
- `GET /api/admin/analytics/revenue` — Revenue breakdown, payment success/failure rates
- `GET /api/admin/analytics/popular-routes` — Most frequent origin-destination pairs
- `GET /api/admin/analytics/user-growth` — New registrations over time

#### Platform Settings
- `GET /api/admin/settings` — Platform configuration
- `PUT /api/admin/settings` — Update commission rates, seat limits, KYC thresholds

### Phase 3: Frontend Admin Pages

#### Layout & Navigation
- **AdminLayout** component — sidebar nav, top bar with admin name, separate from user Layout
- **Route prefix:** `/admin/*` — protected by admin role check
- **Responsive:** Desktop sidebar → mobile hamburger

#### Pages to Build
| Route | Page | Key Features |
|-------|------|-------------|
| `/admin` | **AdminDashboard** | KPI cards (users, rides, revenue, pending KYC), trend charts, recent activities |
| `/admin/users` | **UserManagement** | Searchable table, filters, bulk actions, user detail drawer |
| `/admin/users/:id` | **UserDetail** | Profile, ride history, bookings, reviews, KYC docs, ban/edit |
| `/admin/kyc` | **KYCReview** | Pending queue, side-by-side Aadhaar vs selfie, approve/reject |
| `/admin/rides` | **RideManagement** | Filterable table, status badges, force-cancel, ride detail modal |
| `/admin/bookings` | **BookingManagement** | Booking list, payment status, refund action |
| `/admin/payments` | **PaymentOverview** | Transaction list, revenue charts, refund tracking |
| `/admin/reviews` | **ReviewModeration** | Review list, rating distribution, delete flagged reviews |
| `/admin/sos` | **SOSMonitor** | SOS alert log, contact details, response tracking |
| `/admin/analytics` | **Analytics** | Charts (user growth, revenue, popular routes, ride trends) |
| `/admin/settings` | **PlatformSettings** | Commission %, seat limits, KYC threshold config |

#### Shared Components
- **DataTable** — Sortable, paginated, searchable table component
- **StatCard** — KPI card with icon, value, trend indicator
- **StatusBadge** — Color-coded status pill (verified/pending/rejected, active/cancelled)
- **ConfirmModal** — Confirmation dialog for destructive actions
- **ChartWrapper** — Reusable chart container (use lightweight chart lib like recharts)
- **Sidebar** — Admin navigation with active state
- **Breadcrumb** — Admin page breadcrumb navigation
- **SearchFilter** — Combined search + filter bar component

### Phase 4: Security & Hardening
1. **Rate limiting** on admin endpoints (express-rate-limit)
2. **Audit logging** — Log all admin actions (who, what, when, target) to new `AuditLog` model
3. **Input sanitization** — Add express-mongo-sanitize, xss-clean
4. **CORS tightening** — Restrict admin endpoints to specific origins
5. **Session management** — Admin token expiry shorter than user tokens

### Phase 5: Advanced Features (Future)
1. **Real-time admin notifications** — Socket.io channel for new SOS, KYC submissions
2. **Export to CSV/PDF** — Download user lists, ride data, payment reports
3. **Email templates** — Admin can send system emails (KYC rejection reason, bans)
4. **Activity feed** — Real-time log of all platform events
5. **Multi-admin support** — Super-admin who can manage other admins

---

## Output Format

Generate the plan as a structured document with:
1. **Phase breakdown** with clear deliverables per phase
2. **File-by-file implementation list** (exact file paths to create/modify)
3. **Model schema changes** (exact Mongoose schema additions)
4. **API endpoint specifications** (method, path, request/response shape)
5. **Frontend component tree** for admin section
6. **Database migration notes** (adding role to existing users)
7. **Dependencies to install** (new npm packages)
8. **Testing checklist** per phase
