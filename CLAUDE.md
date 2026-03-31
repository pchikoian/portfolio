@AGENTS.md

# Portfolio Hub

A Node.js/Express web application where users submit their professional portfolios and a manager reviews/approves them.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Templating**: EJS (server-side rendered, partials in `views/partials/`)
- **Styling**: Tailwind CSS via CDN (no build step)
- **Database**: MariaDB 11 via `mysql2` (connection pool, async/await)
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
PORT=3000                               # Server port
MANAGER_PASSWORD=your-secure-password   # Manager login password (default: admin123)
SESSION_SECRET=your-secret              # Cookie session secret
DB_HOST=localhost                       # MariaDB host (default: localhost)
DB_PORT=3306                            # MariaDB port (default: 3306)
DB_USER=portfolio                       # MariaDB user
DB_PASSWORD=portfolio                   # MariaDB password
DB_NAME=portfolio                       # Database name
DB_ROOT_PASSWORD=rootpassword           # MariaDB root password (Docker only)
```
Set in `.env` (Docker Compose picks it up automatically). Never commit secrets.

## Common Commands
```bash
docker compose up --build   # Start app + MariaDB (recommended for dev)
docker compose down -v      # Stop and remove containers + DB volume

npm start                   # Start server directly (requires MariaDB running)
npm run dev                 # Start with auto-reload (node --watch)
```

## Key Files
- `server.js` — Express app, all routes (async/await throughout)
- `db.js` — MariaDB connection pool and query helpers
- `docker-compose.yml` — App + MariaDB services for development
- `views/` — EJS templates
- `views/partials/` — Shared header and footer partials
