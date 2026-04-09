# OneChat

**Talk openly. Stay anonymous.**

OneChat is a public AI chat platform where every conversation is visible to anyone on the internet — and every user remains completely anonymous. There are no private chats. There are no hidden threads. Your identity is never revealed, even though your conversation is.

This is the tension that makes it interesting: radical transparency of content, total privacy of identity.

---

## Features

- **Public by default** — every conversation is publicly readable the moment it is created. No option to make it private. This is a feature.
- **Complete anonymity** — usernames are never shown publicly. Every conversation appears as "Anonymous." Nothing can be traced back to you.
- **Browse without an account** — anyone can read the full conversation feed without signing up.
- **Fork and continue** — any logged-in user can copy a public conversation and continue it from where it left off. Forked chats are labeled as such.
- **Real-time streaming** — AI responses stream in word-by-word via the OpenRouter API, with automatic model fallback.
- **Minimal profile** — logged-in users can view their stats, change their password, and delete their account entirely.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, React Server Components) |
| Styling | Tailwind CSS |
| Auth | NextAuth.js — email/password, JWT sessions |
| Database | PostgreSQL via Prisma ORM |
| AI | OpenRouter API (Gemma, LLaMA, Nemotron — free tier) |
| Deployment | Vercel |

---

## Local Setup

**Prerequisites:** Node.js v18+, Git, a PostgreSQL database.

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/onechat.git
cd onechat
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your values (see [Environment Variables](#environment-variables) below).

To generate a secure `NEXTAUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Push the database schema

```bash
npx prisma db push
```

You should see: `Your database is now in sync with your Prisma schema.`

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up at `/signup`, start a chat, then check `/browse` to see it appear publicly.

---

## Environment Variables

Create a `.env.local` file in the project root with the following:

```env
# PostgreSQL connection string
# Neon, Supabase, Railway, or local — any standard PostgreSQL URL works
DATABASE_URL="postgresql://user:password@host:5432/onechat"

# Random secret used to sign session tokens
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
NEXTAUTH_SECRET="your-random-secret"

# The URL where the app is running
# Use http://localhost:3000 for local development
NEXTAUTH_URL="http://localhost:3000"

# API key from openrouter.ai (free tier available)
OPENROUTER_API_KEY="your-openrouter-api-key"
```

### Getting a free OpenRouter API key

1. Go to [openrouter.ai](https://openrouter.ai) and sign up
2. Navigate to **Keys** and create a new key
3. The free tier includes access to Gemma, LLaMA, Nemotron, and other models

### Getting a free PostgreSQL database

- **[Neon](https://neon.tech)** — recommended. Free tier, generous limits, simple setup.
- **[Supabase](https://supabase.com)** — also free. Use the direct connection string (not the pooler) for `prisma db push`.
- **Local** — `postgresql://postgres:yourpassword@localhost:5432/onechat`

## Contributing

Contributions are welcome. A few principles to keep in mind:

- **No private mode.** This is a philosophical commitment, not a technical limitation. PRs that add private conversations won't be merged.
- **No public usernames.** Anonymity is non-negotiable. Don't surface user identity anywhere in the UI.
- **Keep it simple.** The product has a clear premise. Features that complicate or dilute it are probably wrong.

To contribute:

1. Fork the repository
2. Create a branch: `git checkout -b your-feature`
3. Make your changes and test them locally
4. Open a pull request with a clear description of what and why

---

## License

[AGPL-3.0](LICENSE)

This means: you can use, modify, and distribute this software freely, but any modifications you deploy publicly must also be open source under the same license.
