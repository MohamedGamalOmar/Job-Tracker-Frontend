# Job Tracker — Frontend

React + Vite + TypeScript frontend for the Job Tracker backend. It consumes the
existing Express/SQLite API — no backend code lives here.

## Stack

- React 19, Vite, TypeScript
- Tailwind CSS v4
- React Router v7
- Axios (JWT Bearer interceptor + 401 handling)
- TanStack Query
- React Context for auth state (token persisted in `localStorage`)
- Lucide React icons, Sonner toasts

## Setup

```bash
npm install
cp .env.example .env   # or copy manually on Windows
npm run dev
```

The app runs at http://localhost:5173 by default.

## Configuration

| Variable             | Description                                        |
| -------------------- | -------------------------------------------------- |
| `VITE_API_BASE_URL`  | Backend base URL (without `/api`), e.g. `http://localhost:4000` |

For production, set `VITE_API_BASE_URL` in your hosting provider's environment
variables (e.g. Vercel → Project → Settings → Environment Variables) to the
**HTTPS** URL of the deployed backend. Vite only exposes `VITE_*` variables to
the browser bundle — never put secrets here.

The backend must allow the frontend origin via its `CORS_ORIGIN` env var
(comma-separated list of origins).

## Authentication

- Register / log in at `/register` and `/login`; password reset via
  `/forgot-password` and `/reset-password?token=…`.
- The JWT is stored in `localStorage` and sent as `Authorization: Bearer`
  on every API request. On app start, `GET /api/auth/me` restores the session;
  any `401` clears the stored token and redirects to `/login` (except on the
  auth pages themselves).
- **Public:** dashboard, job browsing (`GET /api/jobs*`), job details.
- **Protected (login required):** `/saved`, `/api/saved-jobs/*`.
- **Admin only:** `/admin/*` (stats, user management, system info, imports).
  `/api/imports/*` endpoints require an admin token — regular users get 403.
  The first admin is created by listing emails in the backend's
  `ADMIN_EMAILS` env var before they register/log in.
- Jobs are read-only — there is no create/edit/delete UI.

## Features

- **Dashboard** — total jobs, jobs collected in the last 7 days, per-source
  counts (Wuzzuf, LinkedIn, Glassdoor, Indeed), and recent jobs.
- **All Jobs** — debounced search (title/company/skills), filters for source,
  location, experience level, and workplace type; sort by latest posted or
  recently collected; server-side pagination (20 per page). Filter state is
  kept in the URL so it survives navigation. Each card shows an accurate
  `saved` flag when logged in.
- **Saved jobs** (`/saved`) — bookmark any job from cards or the details page;
  saved jobs are listed here and can be unsaved.
- **Job details** — full job information with an "Open original job" link.
- **Import Jobs** (admin only, `/admin/imports`) —
  - Platform imports: Wuzzuf, LinkedIn, Glassdoor, Indeed (`POST /api/imports/*`).
    These call the real backend integrations; failures from the upstream
    provider are surfaced as errors — a successful response only means the
    backend processed the request.
  - JSON import (`POST /api/imports/jobs`) — paste a jobs array or
    `{ "jobs": [...] }`.
  - CSV import (`POST /api/imports/jobs`) — upload a `.csv` file with at least
    `title` and `url` columns.
- **Settings** — backend health check and connection info.

## Deployment (Vercel)

1. Import the `frontend/` directory as a Vercel project.
2. Framework preset: Vite (auto-detected). Build: `npm run build`, output: `dist`.
3. Add environment variable `VITE_API_BASE_URL=https://your-backend-domain`.
4. `vercel.json` already includes SPA rewrites for React Router.
5. Set the backend's `APP_URL` to the frontend URL so password-reset emails
   link back to the deployed app, and add the frontend domain to
   `CORS_ORIGIN`.

## Notes

- The cron-protected endpoint (`POST /api/cron/*`) is intentionally
  **not** called from the frontend — it requires a secret that must never ship
  to the browser.
- Location filtering is a substring match on the backend, so the "Other /
  custom" location option accepts free text.
- Unsaving a job that isn't saved returns 404 from the backend; the frontend
  treats that as success.

## Scripts

| Command         | Description          |
| --------------- | -------------------- |
| `npm run dev`   | Start dev server     |
| `npm run build` | Typecheck + build    |
| `npm run lint`  | oxlint               |
| `npm run preview` | Preview production build |

## Project structure

```
src/
├── api/          # axios instance, auth/jobs/imports/saved-jobs clients
├── auth/         # AuthContext provider
├── components/   # shared UI (cards, buttons, save toggle, protected route)
├── hooks/        # useDebounce, useToggleSave
├── layouts/      # sidebar + header shell
├── pages/        # Dashboard, Jobs, JobDetails, Saved, Import, Settings, auth pages
├── types/        # shared TypeScript types
└── App.tsx       # routes
```
