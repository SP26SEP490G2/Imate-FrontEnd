# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

- Git repo root contains the frontend app in `imate_frontend/`.
- Run Node/Vite commands against that subdirectory (examples below use `npm --prefix imate_frontend ...`).

## Development commands

- Install dependencies:
  - `npm --prefix imate_frontend install`
- Start local dev server:
  - `npm --prefix imate_frontend run dev`
- Build production bundle (includes TypeScript project build via `tsc -b`):
  - `npm --prefix imate_frontend run build`
- Lint:
  - `npm --prefix imate_frontend run lint`
- Preview built app:
  - `npm --prefix imate_frontend run preview`
- Lint a single file:
  - `npm --prefix imate_frontend exec eslint src/pages/staff/AddSystemQuestion.tsx`
- Type-check only:
  - `npm --prefix imate_frontend exec tsc -b`

## Tests

- There is currently no test script in `imate_frontend/package.json` and no `*.test`/`*.spec` files detected.
- A “run single test” command is not available until a test runner is added.

## High-level architecture

### App bootstrap and global providers

- Entry point is `imate_frontend/src/main.tsx`.
- `BrowserRouter` is mounted in `main.tsx`, then `App` mounts global providers in this order:
  - `QueryClientProvider` (TanStack Query)
  - `GoogleOAuthProvider`
  - `AppProvider`
  - `AuthProvider`
- `SignalRProvider` exists (`src/store/SignalRContext.tsx`) but is currently commented out in `App.tsx`.

### Routing model

- Route table is composed in `src/routes/index.tsx` by concatenating:
  - `AuthRouter` (sign-in/up, verify/reset password)
  - `CommonRouter` (guest + some staff question pages)
  - `AuthenticatedRouter` (wrapped in `ProtectedRoute` and `MainLayout`)
- `AuthenticatedRouter` currently nests authenticated pages under `/` with `MainLayout` and child routes like `profile`, `submit-mentor-application`, `pending-application`.

### Authorization and role gating

- Core auth/authorization logic is split between:
  - `src/routes/ProtectedRoute.tsx`
  - `src/layout/MainLayout.tsx`
- Both files maintain hardcoded role-route allow/deny lists.
- Mentor `PendingVerification` flow is special-cased: redirect to either `pending-application` or `submit-mentor-application` based on mentor-profile-like fields on `user`.
- Admin is allowed to access staff routes in the role checks.

### API layer and backend contract

- All HTTP calls go through `src/services/apiClient.ts` (Axios instance).
- Base URL comes from `VITE_API_BASE_URL`.
- Request interceptor:
  - Adds `Authorization: Bearer <authToken>` from `localStorage`.
  - Defaults `Content-Type: application/json` except FormData.
- Response interceptor:
  - Handles `401` with refresh-token flow (`POST /refresh-token`).
  - Queues concurrent failed requests during refresh and retries after token renewal.
  - Clears local auth state and redirects to `/sign-in` if refresh fails.
- Endpoint constants are centralized in `src/config/apiConfig.ts`.
- Domain service modules in `src/services/` (auth, account, mentor, question, common) wrap endpoint calls.
- Several list endpoints depend on `x-pagination` response headers and on payload shape `response.data.data`.

### Authentication model

- Firebase is used for client-side auth bootstrap (`src/lib/firebaseConfig.ts`) and then backend token exchange.
- Email login flow:
  1. Firebase `signInWithEmailAndPassword`
  2. Send Firebase ID token to backend (`/login-email`)
  3. Persist backend tokens (`authToken`, `refreshToken`) and fetch `/profile`
- Google login flow follows similar token exchange via `/google`.
- Auth state lives in `src/store/AuthContext.tsx` and mirrors user data into `localStorage` key `user`.

### UI stack and conventions

- React 19 + Vite + TypeScript.
- Tailwind CSS v4 via `@tailwindcss/vite`.
- UI primitives are largely in `src/components/ui/*` (Radix/shadcn-style components).
- Toast systems: both `react-toastify` and `sonner` are used.
- Route labels/UI text are primarily Vietnamese.

## Environment variables

- Current `.env` contains:
  - `VITE_PORT`
  - `VITE_API_BASE_URL`
- `App.tsx` reads Google client ID from `import.meta.env.REACT_APP_GOOGLE_CLIENT_ID` (note non-`VITE_` prefix). Keep this in mind when configuring env values for local/dev/prod.

## Coding Conventions

- **Components:** PascalCase, typically stored in `src/components/...` or `src/pages/...`.
- **Styling:** Use Tailwind CSS with the `cn()` utility (`clsx` + `tailwind-merge`) from `@/lib/utils` for conditional classes.
- **UI Primitives:** Use Radix/shadcn-style components located in `src/components/ui/*`.
- **API Calls:** Do not use `fetch` or `axios` directly inside React components. Define API methods in `src/services/*` utilizing the configured `apiClient.ts` instance to ensure interceptors handle tokens properly.
- **State Management:** Use `@tanstack/react-query` for API state (caching, fetching, updating) and React Context (`src/store/*`) for global client state when needed.
- **Language:** UI Text and Labels should primarily be in Vietnamese.
- **File Extensions:** Use `.tsx` for React UI components and `.ts` for pure TypeScript logic files and domain definitions.
