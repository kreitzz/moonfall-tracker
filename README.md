# Moonfall Tracker

Campaign tracker built on Next.js.

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Character sheet persistence

Character sheets save through the API route at:

- `GET /api/party-sheets/[slug]`
- `PUT /api/party-sheets/[slug]`

Persistence order:

1. Supabase, if configured
2. local file fallback for local/self-hosted dev
3. browser localStorage fallback in the sheet UI if saving fails

## Deploy-safe persistence setup

For real deployed persistence, use Supabase.

### 1. Create the table

Run the SQL in:

- [supabase-party-sheets.sql](./supabase-party-sheets.sql)

### 2. Set environment variables

Add these to your deployment:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_PARTY_SHEETS_TABLE=party_sheets
```

Notes:

- `SUPABASE_PARTY_SHEETS_TABLE` is optional; defaults to `party_sheets`
- the app uses the service role only on the server API route
- do not expose the service role key to the client

### 3. Behavior

When configured:

- character pages load the saved website copy first
- edits autosave back to Supabase
- refreshes keep the saved sheet state on deployment

When not configured:

- local development falls back to file storage under `src/data/party-sheets`
- browser localStorage still acts as a last-resort client fallback

## Important limitation

If you deploy without Supabase and rely on filesystem writes only, most serverless hosts will not persist those writes across requests or redeploys.
