# Canopy – Student Marketplace

Canopy is a Next.js application that lets students connect, offer services, sell products, and collaborate within their college community. It uses OTP-based login with a 1‑week JWT session cookie and redirects returning users straight to their dashboard.

## Tech Stack
- `Next.js 16` (App Router)
- `Prisma` with PostgreSQL
- `Tailwind CSS v4` with `@tailwindcss/postcss`
- `Shadcn UI` components
- `Nodemailer` for OTP email
- `jsonwebtoken` for JWT sessions

## Setup
- Create `.env` file with:
  - `DATABASE_URL` set to your PostgreSQL connection
  - `EMAIL_USER` and `EMAIL_PASS` for Gmail SMTP
  - `JWT_SECRET` for signing session JWTs
- Install dependencies: `npm install`
- Run dev server: `npm run dev`

Tailwind v4 integration:
- PostCSS plugin: `postcss.config.js` uses `"@tailwindcss/postcss"`
- Global CSS imports and theme tokens: `src/app/globals.css`

## Data Model
- `College` and `User` tables; optional `Listing` table for marketplace items
- Migration file: `prisma/migrations/20251112145116_user_created/migration.sql`

## Authentication Flow
- Request OTP: client posts name/email and college to `/api/auth/send-otp`
- Verify OTP: client posts email/otp to `/api/auth/verify-otp`
- On success: sets `HttpOnly` cookie `canopy_token` with `expiresIn: 7d`
- Returning users: `/api/auth/session` validates cookie; UI redirects to dashboard

Key files:
- `src/app/api/auth/send-otp/route.js` – sends OTP email and upserts user
- `src/app/api/auth/verify-otp/route.js:25-36` – verifies OTP, issues JWT cookie
- `src/app/api/auth/session/route.js:4-15` – validates JWT and returns user
- `src/app/college/[name]/login/page.jsx:10-22` – auto-redirect if session present
- `src/app/components/ui/LandingPage.jsx:14-26` – auto-redirect on landing page

## Routes

### Pages
- `/` – Landing page
  - Component: `src/components/ui/LandingPage.jsx`
  - College search suggestions; redirects to login page for selected college
- `/college/[name]/login` – OTP login
  - Component: `src/app/college/[name]/login/page.jsx`
  - Flow: send OTP → verify OTP → issue JWT → redirect to dashboard
- `/college/[name]/dashboard` – user dashboard
  - Component: `src/app/college/[name]/dashboard/page.jsx`
  - Uses `SidebarProvider` and Shadcn sidebar components

### API
- `POST /api/auth/send-otp`
  - Body: `{ collegeName, name, email }`
  - Validates domain via `college_domains.csv` and sends OTP
- `POST /api/auth/verify-otp`
  - Body: `{ email, otp }`
  - Verifies and sets `canopy_token` (HttpOnly, `sameSite: 'lax'`, `secure` in prod, `maxAge` 7 days)
- `GET /api/auth/session`
  - Reads `canopy_token` and returns `{ ok: true, user }` or `401`
- `GET /api/college?name=<exact_name>`
  - Returns one college with domain from CSV
- `GET /api/colleges?query=<string>&limit=<n>`
  - Returns autocomplete suggestions from CSV

## UX Details
- Landing/login auto-redirects returning users to dashboard if `canopy_token` is valid
- College email domain validation before OTP is sent
- OTP expiry window is 5 minutes on issuance

## Important Code References
- OTP issuance: `src/app/api/auth/send-otp/route.js:84-109`
- OTP verification and JWT cookie: `src/app/api/auth/verify-otp/route.js:25-36`
- Session validation endpoint: `src/app/api/auth/session/route.js:4-15`
- Client login submit and redirect: `src/app/college/[name]/login/page.jsx:70-99`
- Landing page search and redirect: `src/components/ui/LandingPage.jsx:42-48`
- Sidebar provider usage: `src/app/college/[name]/dashboard/page.jsx:1-17`

## Development
- Lint: `npm run lint`
- Start: `npm run dev`
- Tailwind v4: use classes directly; gradients are `bg-gradient-to-*` utilities

## Notes for Reviewers
- Security: JWT secrets are never logged; cookie is HttpOnly and secure in production
- Session: 7‑day expiry enables seamless return to dashboard
- Email: In development, if SMTP isn’t configured, OTP logging to console is enabled for testing
