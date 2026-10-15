# ROLLUCK — player app

The player facing frontend app for ROLLUCK: the games lobby, per-category catalogue
pages, game pages and the player's profile. It talks to `rolluck-backend`.

## Tech stack

- **Next.js 14** (pages router, server-side rendering) with **React 18**
- **TypeScript** (strict)
- **Tailwind CSS v4** via PostCSS
- **Axios** for signed-in API calls, native `fetch` for server-side catalogue reads
- **react-toastify** for notifications
- **ESLint + Prettier**, **Husky + lint-staged** git hooks

## Getting started

```bash
npm install
cp .env.example .env     # then point NEXT_PUBLIC_API_BASE_URL at the backend
npm run dev              # http://localhost:5173
```

The backend must be running (default `http://localhost:5000/api`) and seeded
with the games catalogue, otherwise the lobby renders its empty state.

## Pages

| Route                  | What it shows                                                       | Backend endpoints                                                                   |
| ---------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `/`                    | Lobby / dashboard: hero, category cards, welcome strip, one shelf per category (10 per page, paged independently via `?slots=2`) | `GET /games/home` (SSR)                                                             |
| `/games/[category]`    | Every game in one category, 24 per page (`originals`, `new`, `featured`, `slots`) | `GET /games?category=&page=&limit=` (SSR)                                           |
| `/game/[slug]`         | One game: artwork, provider, RTP, bet limits, more from the same category | `GET /games/:slug`, `GET /games?category=` (SSR)                                    |
| `/profile`             | Identity card, wallet, personal information, security (signed in)   | `GET /users/me`, `PATCH /users/me`, `POST /users/me/change-password`, `GET /balance/me` |
| `/auth/login`          | Player login                                                        | `POST /auth/user/login`                                                             |
| `/auth/register`       | Registration                                                        | `POST /auth/register`                                                               |
| `/auth/reset-password` | Password reset                                                      | `POST /auth/reset-password`                                                         |

`/dashboard`, `/login`, `/register` and `/reset-password` redirect to the routes
above (see `next.config.mjs`).

The catalogue categories are defined once in `src/constants/games.ts`, which
mirrors `GAME_SHELVES` in the backend. Add a shelf there and in the backend
constant and the lobby, the rail and the category pages pick it up.

## Session and data flow

- The JWT from `/auth/user/login` lives in `sessionStorage`; `AuthContext`
  restores it on the client and `ProtectedRoute` / `PublicRoute` guard pages.
- `UserContext` fetches `/users/me` once per session and shares it with the top
  bar, the welcome strip and the profile page. It also applies the player's
  stored theme.
- Catalogue pages are server-rendered from `src/services/games.server.ts`
  (plain `fetch`, no token). Signed-in calls go through `src/services/api.ts`
  (Axios with the bearer token attached).

## Scripts

| Script                 | What it does                            |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Start the Next dev server on port 5173  |
| `npm run build`        | Production build                        |
| `npm run start`        | Serve the production build on port 5173 |
| `npm run lint`         | ESLint                                  |
| `npm run lint:fix`     | ESLint with auto-fix                    |
| `npm run format`       | Prettier                                |
| `npm run type-check`   | `tsc --noEmit`                          |

## Environment

| Variable                      | Purpose                                                     |
| ----------------------------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`    | Backend base URL, e.g. `http://localhost:5000/api`          |
| `NEXT_PUBLIC_PASSWORD_SECRET` | Shared password-obfuscation key; must match the backend     |
| `API_BASE_URL_INTERNAL`       | Optional server-side override of the API URL (containers)   |
| `HUSKY_ENABLED`               | `false` skips the git hooks                                 |

`NEXT_PUBLIC_*` values are baked into the browser bundle at build time.

## Git hooks

- **pre-commit** runs `lint-staged` (ESLint + Prettier on staged files)
- **pre-push** runs `npm run type-check`
- **commit-msg** enforces Conventional Commits (`feat:`, `fix:`, `docs:`, …)

Set `HUSKY_ENABLED=false` in `.env` to skip them locally.

## Project structure

```
src/
├── components/
│   ├── auth/            # AuthShell, AuthField
│   ├── modals/          # Logout confirm, profile edit modals
│   ├── player/          # Sidebar, top bar, balance menu, game tiles/rows, pager
│   ├── profile/         # Profile header, sections, wallet
│   └── icons.tsx
├── constants/           # roles, games (category definitions)
├── context/             # Auth, Theme, I18n, User
├── i18n/locales.ts      # 9 locales; English is the source of truth for keys
├── layout/PlayerLayout.tsx
├── pages/               # Next.js routes
├── routes/              # ProtectedRoute, PublicRoute
├── services/            # api.ts (Axios), games.server.ts (SSR fetch)
├── types/
└── utils/
```
