@AGENTS.md

# Portfolio Hub

A Node.js/Express web application where users submit their professional portfolios and a manager reviews/approves them.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Templating**: EJS (server-side rendered, partials in `views/partials/`)
- **Styling**: Tailwind CSS via CDN (no build step)
- **Database**: SQLite via `better-sqlite3` (file: `portfolios.db` at project root)
- **Auth**: express-session (cookie-based manager session)

## Features
- `/` — Public home: lists approved portfolios
- `/submit` — Portfolio submission form (POST → DB → redirect)
- `/portfolio/:id` — Individual portfolio view
- `/manager/login` — Manager login (password via `MANAGER_PASSWORD` env var, default: `admin123`)
- `/manager` — Manager dashboard: review, approve, reject portfolios
- `/manager/logout` — Sign out

## Environment Variables
```
MANAGER_PASSWORD=your-secure-password   # Manager login password (default: admin123)
SESSION_SECRET=your-secret              # Cookie session secret
PORT=3000                               # Server port
```
Set in `.env` or export before running (never commit secrets).

## Common Commands
```bash
npm start        # Start server (node server.js)
npm run dev      # Start with auto-reload (node --watch server.js)
```

## Key Files
- `server.js` — Express app, all routes
- `db.js` — SQLite setup and query helpers
- `views/` — EJS templates
- `views/partials/` — Shared header and footer partials
