# Sourcewise

Daily India news — mobile-first, facts only, one IST edition per day.

**Tagline:** No political bias — present facts as they happened; let readers judge for themselves.

## Quick start

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run fetch:daily-edition
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Set `USE_MOCK_NEWS=true` in `.env` to seed **90 mock articles per language** (180 total) without RSS/API keys.

Use the **English / हिंदी** toggle in the header (`?lang=hi` for Hindi).

## Architecture

- **Next.js App Router** + TypeScript + Tailwind CSS
- **Prisma** + PostgreSQL (Neon/Supabase; required on Vercel)
- **Daily cron** publishes one edition per IST calendar day
- **RSS ingestion** from reputable Indian sources; optional NewsAPI fallback
- **Votes** stored in DB; one vote per article per voter ID per edition day

## Environment variables

See `.env.example`:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL URL (Neon) — same locally and on Vercel |
| `USE_MOCK_NEWS` | `true` = mock 90-article edition (no network) |
| `NEWS_API_KEY` | Optional NewsAPI.org fallback |
| `OPENAI_API_KEY` | Reserved for future neutral summarization |
| `CRON_SECRET` | Bearer token for `/api/cron/daily-edition` |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for share links / OG tags |

## Daily edition pipeline

1. Fetch RSS feeds per category (or mock data)
2. Deduplicate by URL and title similarity
3. Filter likely opinion pieces (`opinion`, `editorial`, `analysis`, etc.)
4. Trim summaries to ~100 words
5. Publish edition for today's IST date

### Manual run

```bash
npm run fetch:daily-edition
# optional specific date
npm run fetch:daily-edition -- 2026-05-31
```

### Cron (Vercel)

`vercel.json` triggers `GET /api/cron/daily-edition` daily at **9:00 AM IST** (03:30 UTC).

Each run **deletes the previous edition**, all articles, and all votes, then publishes a fresh feed.

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-domain.com/api/cron/daily-edition
```

## Sentiment & votes

- Every vote is stored in the `Vote` table with article ID, voter ID, vote type, and hashed IP.
- Per-article totals live on `Article.goodVotes` / `badVotes`.
- **Edition-wide pulse** is rolled up in `EditionSentiment` and shown in the “Today’s reader pulse” bar.
- Votes update live through the day; everything resets at the next 9 AM refresh.

## Top 3 stories

Ranked server-side by total votes on the current edition (`getTopStories`). Requires the backend — no way to rank honestly from the client alone.

## Bot mitigation (MVP)

- One vote per article per browser ID
- Hashed IP with a daily cap (90 votes per network per edition)
- Invalid voter IDs rejected

For production, add Cloudflare Turnstile on vote, stricter rate limits, or optional accounts.

## API routes

- `GET /api/edition?date=YYYY-MM-DD` — edition JSON
- `POST /api/votes` — `{ articleId, voteType: "GOOD"|"BAD", voterId, editionDate? }`
- `GET /api/cron/daily-edition` — publish today's edition (authorized)

## News sources (RSS)

### Politics
- [The Hindu National](https://www.thehindu.com/news/national/?service=rss)
- [Indian Express India](https://indianexpress.com/section/india/feed/)
- [LiveMint News](https://www.livemint.com/rss/news)
- [BBC India](https://feeds.bbci.co.uk/news/world/asia/india/rss.xml)
- [PIB India](https://pib.gov.in/rss.aspx)

### Sports
- [The Hindu Sport](https://www.thehindu.com/sport/?service=rss)
- [Indian Express Sports](https://indianexpress.com/section/sports/feed/)
- [ESPN Cricinfo India](https://www.espncricinfo.com/rss/content/story/feeds/6.xml)

### Science & Technology
- [The Hindu Sci-Tech](https://www.thehindu.com/sci-tech/?service=rss)
- [Indian Express Technology](https://indianexpress.com/section/technology/feed/)
- [LiveMint Technology](https://www.livemint.com/rss/technology)

Optional: [NewsAPI.org](https://newsapi.org) with `country=in`.

Respect robots.txt and publisher terms. Always link to originals.

## Editor guidelines (bias / summaries)

- Report **who, what, when, where** only
- No loaded adjectives, spin, or national good/bad framing in copy
- Summaries ≤ 100 words
- Headlines neutral and factual
- Keep original source link on every card

## Vote limitations (MVP)

Votes use a browser `localStorage` voter ID plus server uniqueness on `(articleId, voterId, editionDate)`. Shared devices, cleared storage, or incognito can bypass or block votes. Documented on `/privacy`.

## Vercel shows `404 NOT_FOUND` (plain page, `cle1::…` id)

That is **Vercel**, not your app — usually **no successful Production deploy** exists at that URL.

1. Open **Deployments** → latest **Production** must be **Ready** (green). If **Error**, open the build log.
2. Open the URL from that deployment row (e.g. `source-wise-xxxx.vercel.app`), not a guessed name like `sourcewise.vercel.app`.
3. **Settings → General → Root Directory** must be empty (repo root, where `package.json` lives).
4. After Neon: ensure `DATABASE_URL` + `DATABASE_URL_UNPOOLED` exist, then **Redeploy**.
5. Smoke test: `https://YOUR-DEPLOYMENT.vercel.app/api/health` → `{"ok":true}`.

## Deploy (Vercel + Postgres)

1. Create a free [Neon](https://neon.tech) or Supabase Postgres database
2. In Vercel → **Settings → Environment Variables**, add (enable for **Production** at minimum):
   - `DATABASE_URL` — Postgres connection string (migrations run on deploy when this is set)
   - `CRON_SECRET` — random secret for `/api/cron/daily-edition`
   - `NEXT_PUBLIC_SITE_URL` — e.g. `https://your-app.vercel.app`
   - `USE_MOCK_NEWS` — `false` for live RSS
3. Redeploy (build runs `prisma migrate deploy` automatically)
4. After deploy, trigger the first edition:
   ```bash
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-app.vercel.app/api/cron/daily-edition
   ```

## Out of scope v1

User accounts, comments, push notifications, live tickers, personalized feeds, subscriptions.
