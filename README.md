# MediBook — Healthcare Booking System

Full-stack CRUD booking system: React frontend + Node.js/Express API + Neon (serverless PostgreSQL).

---

## Project structure

```
medibook/
├── backend/
│   ├── server.js       ← Express routes: GET, POST, PUT, DELETE
│   ├── db.js            ← Neon connection + auto table creation
│   ├── .env.example     ← Copy to .env, paste your Neon connection string
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.jsx                 ← Main app: state, fetch, filter, search
    │   ├── api.js                  ← Axios calls to the API
    │   ├── index.js                ← Entry point
    │   ├── index.css               ← Global styles
    │   └── components/
    │       ├── BookingForm.jsx     ← Create / edit form
    │       ├── BookingCard.jsx     ← Single appointment card
    │       └── StatsRow.jsx        ← Summary numbers
    ├── public/index.html
    ├── .env.example
    └── package.json
```

---

## 1. Create your Neon database

1. Go to [neon.tech](https://neon.tech) → sign up (GitHub login is fastest)
2. Click **New project** → name it `medibook` → pick the closest region → **Create project**
3. On the dashboard, open **Connection Details** and copy the connection string. It looks like:
   ```
   postgresql://user:password@ep-xxxx.region.aws.neon.tech/medibook?sslmode=require
   ```

---

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and paste your Neon connection string into `DATABASE_URL`.

```bash
npm run dev
```

You should see:
```
Connected to Neon PostgreSQL.
Bookings table ready.
MediBook API running on http://localhost:5000
```

The `bookings` table is created automatically — nothing to set up manually.

### Verify it works

Open `http://localhost:5000/bookings` in your browser — you should see `[]`.

Or test with curl:
```bash
curl -X POST http://localhost:5000/bookings \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Patient","date":"2026-07-10","time":"9:00 AM","doctor":"Dr. Sarah Chen — General Practice","status":"pending"}'
```

### API endpoints

| Method | Route          | Description        |
|--------|----------------|---------------------|
| GET    | /bookings      | List all bookings (supports `?status=` and `?user_id=`) |
| GET    | /bookings/:id  | Get one booking     |
| POST   | /bookings      | Create a booking    |
| PUT    | /bookings/:id  | Update a booking    |
| DELETE | /bookings/:id  | Delete a booking    |

---

## 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

Opens at `http://localhost:3000`. The `.env` already points to `http://localhost:5000` for local development — no changes needed.

---

## 4. Deployment

### Backend → Railway

1. Push your project to GitHub
2. Go to [railway.app](https://railway.app) → New project → Deploy from GitHub repo
3. Set the root directory to `backend/`
4. Add environment variable `DATABASE_URL` — paste the same Neon connection string
5. Railway gives you a public URL, e.g. `https://medibook-api.up.railway.app`

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New project → import your GitHub repo
2. Set root directory to `frontend/`
3. Add environment variable `REACT_APP_API_URL` = your Railway backend URL
4. Deploy

### Optional: connect Neon directly through Vercel

In your Vercel project → **Storage** tab → **Connect Store** → choose **Neon**. Vercel will auto-link the database and inject `DATABASE_URL` for you — useful if you deploy the backend as Vercel serverless functions instead of Railway.

---

## Notes

- Neon's free tier pauses after 5 minutes of inactivity and auto-wakes on the next request (~1 second delay). Fine for development and demos — just open the app a few seconds before presenting.
- Free tier includes 0.5 GB storage, more than enough for a class project.

---

## Features

- Full CRUD: create, read, update, delete appointments
- Live search by patient name, doctor, or date
- Filter by status: all / confirmed / pending / cancelled
- Stats dashboard with live totals
- Status badges (confirmed / pending / cancelled)
- Delete confirmation modal
- Toast notifications for every action
- Responsive layout with React Bootstrap

## Optional extensions (bonus marks)

- Firebase Authentication — restrict each user to their own bookings
- React Router — add `/login` and `/bookings` routes
- Email reminders — see https://mailtrap.io/blog/send-emails-with-nodejs/
- Google Calendar sync — see https://stateful.com/blog/google-calendar-react
- Admin account to view all bookings across users
