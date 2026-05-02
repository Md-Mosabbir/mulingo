# Free Production Deployment Guide

This setup deploys:
- Frontend -> Vercel (free)
- Backend -> Render Web Service (free)
- Database -> Free MySQL provider (Aiven, Railway trial, PlanetScale, or Clever Cloud)

## 1) Database (free MySQL)

Create a free MySQL instance from any provider and collect:
- Host
- Port
- Username
- Password
- Database name
- SSL requirement (usually required)

Use either:
- `DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DB_NAME`
or
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true`

Then import your schema (from local machine or provider SQL console):
- `backend/schema/schema.sql`
- `backend/schema/submission_extras.sql`

## 2) Backend on Render (free)

Render config is already provided in `render.yaml`.

Create a new Web Service from this repository and set these environment variables:
- `NODE_ENV=production`
- `PORT=10000` (Render usually sets this automatically, but setting it is safe)
- `CORS_ORIGIN=https://<your-vercel-domain>`
- `GOOGLE_CLIENT_ID=<your_google_oauth_client_id>`
- `JWT_SECRET=<strong_random_secret>`
- `GROQ_API_KEY=<your_groq_api_key>`

And DB envs (choose one approach):
- `DATABASE_URL=<mysql_connection_url>`
or
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true`

After deploy, verify:
- `https://<your-render-backend>/health`

## 3) Frontend on Vercel (free)

Deploy the `frontend` directory as a Vercel project.

Recommended Vercel settings:
- Framework: Vite
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

Set Vercel environment variables:
- `VITE_API_BASE_URL=https://<your-render-backend>`
- `VITE_GOOGLE_CLIENT_ID=<same_google_client_id_as_backend>`

`frontend/vercel.json` is added so React routes work on refresh.

## 4) Google OAuth production fix

In Google Cloud Console -> OAuth Client:
- Add Vercel domain to Authorized JavaScript origins
- Add app callback URI(s) if needed by your frontend flow
- Keep `GOOGLE_CLIENT_ID` identical in frontend + backend

## 5) Order to deploy

1. Deploy database and import schema
2. Deploy backend on Render with DB env vars
3. Deploy frontend on Vercel with backend URL
4. Update backend `CORS_ORIGIN` to Vercel domain(s)
5. Re-deploy backend if envs changed

## 6) Useful free-tier notes

- Render free may sleep after inactivity (first request can be slow)
- Keep payload sizes and request volume low on free tiers
- Use a strong `JWT_SECRET` and never commit `.env` files
