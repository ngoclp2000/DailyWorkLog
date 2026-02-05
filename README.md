# Daily Worklog Monorepo

This repo contains a simple monorepo with separate `frontend` and `backend` folders, each with its own `node_modules`.

## Tech stack
- Frontend: Vue 3 + TypeScript (Vite) + Naive UI
- Backend: Node.js + Express
- Database: MySQL (via `mysql2` dependency; not wired yet)

## Development

### Backend
```bash
cd backend
npm install
npm run dev
```

**Default demo account**
- Email: `demo@dailyworklog.vn`
- Password: `password123`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend to run on `http://localhost:3001`.
