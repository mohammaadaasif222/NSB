# Moving the admin panel to its own app

The admin panel runs inside `apps/web` today. This is how it stays movable, and the steps to move it.

## The boundary

| Code | Lives in | May import |
|---|---|---|
| Admin | `app/admin/`, `components/admin/`, `lib/admin-*` | shared code, never site code |
| Public site | `app/(home)/`, `app/(site)/`, `app/actions/`, `components/site/`, site-only `lib/` files | shared code, never admin code |
| Shared UI | `components/shared/` | neither |
| Shared helpers | `lib/api.ts`, `lib/format.ts`, `lib/browse-panels.ts`, `lib/search-params.ts`, `@nsb/shared` | neither |

`npm run lint -w @nsb/web` fails when an import crosses it (`eslint.config.mjs`).

The API is already independent. Both apps talk only to it, the roles live in `@nsb/shared`, and `AdminGuard` enforces every admin route on the server. `useCan` and `editorsOnly` only hide what a role can't use.

## The move

Keep the same-origin pattern: the new app proxies `/api/*` to the API, as this one does. The session cookie then stays first-party on the admin domain, so the API needs no CORS, no cookie change and no CSRF change. Do not point the admin's browser code straight at another origin without adding CORS and CSRF protection first.

1. Create `apps/admin` as a Next.js app, with the same `rewrites()` for `/api/*` and `API_INTERNAL_URL`. Copy the rest of `next.config.ts` too: `images.remotePatterns`, `output: "standalone"` and `outputFileTracingRoot`. Add what the root of `app/` gives the admin today: a root layout, `not-found`, `icon.png` and `apple-icon.png`, and a redirect from `/` to `/admin`.
2. Move `app/admin/`, `components/admin/` and `lib/admin-*`. Keeping the `/admin` paths means no link changes.
3. Copy `components/shared/`, `lib/api.ts`, `lib/format.ts`, `lib/browse-panels.ts` and `lib/search-params.ts`, or turn them into a `packages/ui` workspace. Copy the design tokens and `animate-rise` from `globals.css`, Inter from the root layout, and `lib/fonts.ts`. Copy `public/images` as well, not only `images/admin` and the logo: saved categories and home cards hold relative `/images/...` paths, and the admin previews them.
4. Move the `/admin` branch of `proxy.ts`, and remove the `/admin` line from `robots.ts`. The panel's layout sets `noindex`, but the login page sits outside that layout and has only this line, so add `noindex` to its metadata.
5. Set `NEXT_PUBLIC_SITE_URL` on the admin app, so its links reach the public site.
6. Set `ADMIN_URL` on the API, so alert emails link to the new address.
7. Add an admin host to `deploy/Caddyfile` and a service to `deploy/docker-compose.yml`, with `/api/*` going to the API. Next.js fixes `NEXT_PUBLIC_SITE_URL` and the `rewrites()` target at build time, so both need Docker build args (`ARG` in the Dockerfile, `build.args` in compose). `environment` alone does not change them. Server code also reads `API_INTERNAL_URL` at runtime, so set it in both places.
8. Log in again on the new domain: the old cookie belongs to the old host.

No database change is needed. Public data is cached for 60 seconds, and an admin save clears that cache through `app/admin/revalidate`, which needs the site's Next.js app. After the split, the admin must call an equivalent route on the site, or saves show within a minute.

## Still to tidy

- `project-form.tsx`, `listing-form.tsx` and `lead-dialog.tsx` hold validation and payload building that could move to plain functions or shared schemas.
- Google Tag Manager is in the root layout, so it also runs on admin pages. Moving the admin ends that.
