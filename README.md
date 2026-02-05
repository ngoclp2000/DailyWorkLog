# Daily Worklog Monorepo

This repo contains a simple monorepo with separate `frontend` and `backend` folders, each with its own `node_modules`.

## Tech stack
- Frontend: Vue 3 + TypeScript (Vite) + Naive UI
- Backend: Node.js + Express
- Database: MySQL (via `mysql2`)

## Development

### Backend
```bash
cd backend
npm install
npm run dev
```

**Database config (backend)**
- `DB_URL` (default: `mysql://root:@localhost:3306/dailyworklog`)

Run the SQL schema in `backend/sql/init_dwl.sql` before starting the backend, and seed at least one user + worklog columns for your account.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend to run on `http://localhost:3001`.
