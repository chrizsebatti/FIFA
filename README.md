# FIFA World Cup 2026 Prediction App

Mobile-first web app for predicting FIFA World Cup 2026 match winners and scores.

## Features

- Customers join with phone number (no OTP)
- Predict match winner and exact score before kickoff
- Predictions lock when match starts
- Scoring: 50 pts (correct winner), 100 pts (correct winner + exact score)
- Public leaderboard
- Admin dashboard to manage matches, view predictions, and enter results

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

3. Start development (runs API on :5001 and client on :5173):

```bash
npm run dev
```

4. Open http://localhost:5173

## Production

```bash
npm run build
NODE_ENV=production npm start
```

Express serves the built React app from `client/dist` and the API on the same port.

## Admin Access

- URL: `/admin`
- Credentials: set via `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `server/.env`

## API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/join` | Join with phone number |
| `GET /api/matches` | List matches |
| `POST /api/predictions` | Create/update prediction |
| `GET /api/leaderboard` | Top 50 users |
| `POST /api/admin/login` | Admin login |
| `POST /api/admin/matches` | Create match |
| `PUT /api/admin/matches/:id` | Update match / enter result |
