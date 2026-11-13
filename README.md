# SOCCER EDATHIRINJI

Admin web app scaffold with login and a simple dashboard.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Configure environment — copy `.env.example` to `server/.env` and set:

```
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-random-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password
PORT=5001
```

> **Note:** Port `5000` is often taken on macOS by AirPlay Receiver. Default is `5001`.

> If you still have an old prediction database on that URI, drop it once:  
> `mongosh "$MONGODB_URI" --eval 'db.dropDatabase()'`

3. Start development (runs API on :5001 and client on :5173):

```bash
npm run dev
```

4. Open http://localhost:5173 — redirects to `/admin`

## Production

```bash
npm run build
NODE_ENV=production npm start
```

Express serves the built React app from `client/dist` and the API on the same port.

## Admin Access

- URL: `/admin`
- Credentials: set via `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `server/.env`
- After login: `/admin/dashboard` shows **SOCCER EDATHIRINJI**

## API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/admin/login` | Admin login |
| `GET /api/health` | Health check |
