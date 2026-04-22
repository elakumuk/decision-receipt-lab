# Ovrule

Ovrule is a Next.js 14 App Router project for auditing AI agent actions as structured case files. It classifies proposed actions, produces a signed receipt with rule trace and evidence gaps, logs contests, and supports reviewer overrides through a case-management UI.

## Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- OpenAI official SDK
- Supabase JavaScript client
- Upstash Redis rate limiting
- Zod validation
- Node `crypto` for SHA-256 receipt IDs

## Project Structure

```text
ovrule/
├── app/
│   ├── api/
│   │   ├── classify/route.ts
│   │   └── contest/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── lib/
├── public/
├── .env.local.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local environment file:

   ```bash
   cp .env.local.example .env.local
   ```

3. Fill in:

   ```env
   OPENAI_API_KEY=
   SUPABASE_URL=
   SUPABASE_ANON_KEY=
   UPSTASH_REDIS_REST_URL=
   UPSTASH_REDIS_REST_TOKEN=
   ```

4. Start development:

   ```bash
   npm run dev
   ```

5. Verify:

   ```bash
   npm run lint
   npm run build
   ```

## API Notes

`POST /api/classify`

- Validates input with Zod.
- Uses OpenAI when `OPENAI_API_KEY` is present.
- Is rate limited to 10 requests per minute per IP with Upstash Redis.

`POST /api/contest`

- Validates input with Zod.
- Generates a SHA-256 receipt ID from the submission payload.
- Attempts to write to a `decision_contests` Supabase table when Supabase credentials are configured.

`POST /api/override`

- Validates reviewer override input with Zod.
- Writes reviewer actions to `receipt_overrides`.
- Appends a new event to `receipt_history` for the case timeline.

Suggested table schema:

```sql
create table if not exists decision_contests (
  id bigint generated always as identity primary key,
  receipt_id text not null unique,
  decision text not null,
  rationale text not null,
  user_email text,
  created_at timestamp with time zone default now()
);
```

## Deployment

### Vercel

1. Push the repository to GitHub.
2. Import the GitHub repository into Vercel.
3. Add `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN` in the Vercel project settings.
4. Keep `main` as the production branch so pushes to `main` create production deployments.
5. Open pull requests against `main` to get automatic preview deployments.
6. Optionally add a custom domain in the Vercel project `Settings -> Domains` screen.

Example CLI flow:

```bash
npx vercel link
npx vercel env add OPENAI_API_KEY production
npx vercel env add OPENAI_API_KEY preview
npx vercel env add OPENAI_API_KEY development
npx vercel env add SUPABASE_URL production
npx vercel env add SUPABASE_URL preview
npx vercel env add SUPABASE_URL development
npx vercel env add SUPABASE_ANON_KEY production
npx vercel env add SUPABASE_ANON_KEY preview
npx vercel env add SUPABASE_ANON_KEY development
npx vercel env add UPSTASH_REDIS_REST_URL production
npx vercel env add UPSTASH_REDIS_REST_URL preview
npx vercel env add UPSTASH_REDIS_REST_URL development
npx vercel env add UPSTASH_REDIS_REST_TOKEN production
npx vercel env add UPSTASH_REDIS_REST_TOKEN preview
npx vercel env add UPSTASH_REDIS_REST_TOKEN development
npx vercel --prod
```

### Manual Production Build

```bash
npm run build
npm run start
```

## Phase 2

- Comparable precedents via vector search and retrieval-backed case matching
- Policy mode with user-uploaded rules and organization-specific decision logic
