# AEGIS

AEGIS is a calm, consent-first support layer that helps older adults stay connected to trusted family and local support while keeping control of what they share.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/aegis-app run dev` — run the AEGIS web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter + TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (OpenAPI is the source of truth)
- Build: Vite and esbuild

## Where things live

- `artifacts/aegis-app/` — responsive web app and public trust/legal pages
- `artifacts/api-server/src/routes/aegis.ts` — AEGIS API handlers
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/db/src/schema/aegis.ts` — persisted AEGIS schema
- `AEGIS_LAUNCH_RISK_REVIEW.md` — implementation risk register and pre-launch review

## Architecture decisions

- The first build uses a single fictional demo profile so the product can be explored immediately without pretending authentication or multi-user isolation is complete.
- OpenAPI drives both the generated React Query hooks and server-side Zod validation; every primary interaction has a typed endpoint.
- Emergency language deliberately distinguishes notifying selected trusted contacts from contacting emergency services.
- Health functionality is limited to user-entered reminders and appointments; it does not diagnose, recommend treatment, or claim clinical accuracy.
- No third-party analytics, external embeds, payment flows, or tracking scripts are included in this first build.

## Product

- Public landing, about, how-it-works, safety, accessibility, contact, and legal template pages
- Today dashboard with check-in state, next reminder, recent activity, and trusted-network summary
- Family, help requests, services, health reminders, notifications, profile/accessibility settings, privacy permissions, and emergency-contact notification flow
- Responsive phone-first shell with keyboard-friendly forms, large touch targets, reduced-motion support, and human-readable empty/error states

## Gotchas

- The demo is not production-ready for real users until authentication, user-scoped authorization, consent audit trails, and role-separated dashboards are implemented.
- Business details and legal copy contain explicit placeholders for qualified legal/compliance review.
- The frontend artifact must run through its managed workflow so `PORT`, `BASE_PATH`, and proxy routing are available.

## Pointers

- See `AEGIS_LAUNCH_RISK_REVIEW.md` before any public launch.
- See the `pnpm-workspace` skill for workspace structure and shared monorepo rules.