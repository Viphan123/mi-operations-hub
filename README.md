# MI Operations Hub

A marketing intelligence operations workspace built with Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui conventions.

## Local development

Install Node.js 20.9 or later, then install dependencies and start the development server:

```bash
npm ci
npm run dev
```

Open http://localhost:3000 to view the dashboard.

## Cloudflare Workers deployment

The application is built with OpenNext for Cloudflare and deployed using Wrangler. Create a Cloudflare API token with permission to deploy Workers and manage D1, then set `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as GitHub Actions secrets. Pushes to `main` build the Worker, create or reuse the D1 database, apply migrations, and deploy using `.github/workflows/deploy.yml`; to deploy locally, authenticate Wrangler and run:

```bash
npm run deploy
```

To build and preview the Worker locally:

```bash
npm run build
npm run preview
```

The Worker config is in `wrangler.jsonc`; OpenNext writes the deployable Worker and static assets to `.open-next/`.

### D1 and private access setup

1. The deployment workflow creates the `mi-operations-hub` D1 database if it does not exist and configures its ID for that deployment. For local preview or deployment, create or reuse the database and replace the `database_id` placeholder in `wrangler.jsonc` with its ID:

   ```bash
   npx wrangler d1 create mi-operations-hub
   ```

2. Protect the Worker hostname with a Cloudflare Access application. Set its policy to the organization members who may view the MI workspace; API requests and page rendering also verify the signed Access JWT and its audience.
3. Configure these Worker secrets. `CF_ACCESS_TEAM_DOMAIN` is the team domain (for example, `team-name.cloudflareaccess.com`), `CF_ACCESS_AUD` is the Access application's audience tag, and `MI_EDITOR_EMAILS` is a comma-separated allowlist of users permitted to add, edit, and delete deliverables:

   ```bash
   npx wrangler secret put CF_ACCESS_TEAM_DOMAIN
   npx wrangler secret put CF_ACCESS_AUD
   npx wrangler secret put MI_EDITOR_EMAILS
   ```

4. The deployment workflow applies D1 migrations before deploying. To apply migrations manually:

   ```bash
   npx wrangler d1 migrations apply mi-operations-hub --remote
   ```

   On the first authenticated request from an allowed editor, the application seeds the 34 existing deliverables into D1. Until Access and editor secrets are configured, the app and API fail closed; D1 reads and writes are never exposed to anonymous requests.

Local Next.js development also uses the configured Cloudflare bindings through OpenNext. Use Cloudflare Access credentials and a D1 local/remote binding for authenticated API testing; there is intentionally no unauthenticated development bypass.

## Routes

- `/` Dashboard
- `/deliverables` Deliverables
- `/calendar` Calendar
- `/knowledge-base` Knowledge Base
- `/admin` Admin

## Scripts

- `npm run dev` starts the local Next.js development server
- `npm run build` builds the Next.js application
- `npm run build:worker` builds the Cloudflare Worker with OpenNext
- `npm run preview` serves the Worker locally
- `npm run deploy` builds and deploys the Worker with Wrangler
- `npm run lint` runs ESLint
- `npm run typecheck` runs TypeScript checks
