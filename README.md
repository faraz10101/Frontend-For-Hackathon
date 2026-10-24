# ScamShield Frontend

React 19 + Vite + Tailwind 4.

## Run (development)
```
npm install
npm run dev        # http://localhost:5173, /api is proxied to http://localhost:5000
```
Start the backend first. To point at another backend: `VITE_API_TARGET=https://your-api npm run dev`.

## Deploy (Vercel)
In `vercel.json` replace `YOUR-BACKEND-URL` with your real backend address (no trailing slash), then deploy.
The second rule makes page refreshes on /check, /report ... work.
