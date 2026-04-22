# Decision Receipt Lab

Decision Receipt Lab is a Next.js 14 App Router project for prototyping decision classification and contest flows. The app provides a landing page at `/`, a decision classification API at `/api/classify`, and a contest receipt API at `/api/contest`.

## Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- OpenAI official SDK
- Supabase JavaScript client
- Zod validation
- Node `crypto` for SHA-256 receipt IDs

## Project Structure

```text
decision-receipt-lab/
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
- Falls back to a deterministic heuristic classifier when no API key is configured.

`POST /api/contest`

- Validates input with Zod.
- Generates a SHA-256 receipt ID from the submission payload.
- Attempts to write to a `decision_contests` Supabase table when Supabase credentials are configured.

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
2. Import the repository into Vercel.
3. Add `OPENAI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY` in the Vercel project settings.
4. Deploy.

### Manual Production Build

```bash
npm run build
npm run start
```
