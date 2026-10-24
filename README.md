# ScamShield Frontend

The website of ScamShield: check suspicious messages, links and numbers, report scams, and see what scammers are doing right now.
React 19 + Vite + Tailwind CSS 4. It talks to the backend only through `/api/...` (see `../backend/README.md`).

---

## What users can do

| Page | Features |
|---|---|
| **Home** (`/`) | **Live scam feed** open to everyone (no login): real-world scam news, updated automatically every 6 hours, with a "Latest" list and 4 topic tabs. Answers are short and colour coded: red **Watch out**, green **Protect yourself**, plus source links. Below it: today's scam statistics, trends, top cities and top reported numbers, with a city filter. |
| **Get current data now** (Home, login) | A logged-in user fetches **fresh data**: pick a topic or type their own search. 5 searches a day with a visible counter. The result is saved in their account and is still there after a page reload. Guests see a login button. |
| **Check** (`/check`) | Paste a message, link or number (up to 2000 characters). Gets a verdict (scam / suspicious / safe), a risk score, reasons, and what to do. The AI judges it with its own knowledge, not only saved reports, and links are opened safely by the server. |
| **Lookup** (`/lookup`) | Quick reputation of a phone number or link, and a copy-ready complaint text when many people reported it. |
| **Report** (`/report`, login) | Report a scam (message, numbers, link, amount lost, city). One report per verified person. |
| **Login / Sign up / Verify** | Account with an email verification code. |
| **Admin** (`/admin`, admin accounts only) | Add and manage AI providers (see below). |

## Admin panel (for the site owner)
1. Log in with an admin account (see the backend README: set `role: "admin"` in the database). An **Admin** link appears.
2. Enter the **ADMIN_KEY** from the backend `.env`. It is kept only for this browser tab.
3. **Add provider**: choose the type (`gemini` or `openai` = any OpenAI-compatible API such as River, Groq, OpenRouter, apinex), a name, the base URL (for `openai`) and the API key. **Leave Model empty**: the server tests the models itself, keeps the first that works and saves backups.
4. Optional: **Load models (optional)** shows the list so you can choose by hand.
5. Buttons: **Test all providers**, **Reset cooldowns**, **Refresh live feed now** (fills the public feed immediately). Per provider: priority (lowest first), enable / disable, **Model** (choose by hand or **Auto-pick best model**), **Test**, delete.

---

## Run locally
Start the backend first (`../backend`, port 5000), then:
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173  (/api is proxied to http://localhost:5000)
```
Another backend: `VITE_API_TARGET=https://your-api npm run dev`
(Windows PowerShell: `$env:VITE_API_TARGET="https://your-api"; npm run dev`)

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |

---

## Deploy on Vercel
The website calls `/api/...` on its own address. `vercel.json` forwards those calls to your backend, so the login cookie stays on one site and there are no CORS problems:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://YOUR-BACKEND-URL/api/:path*" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

1. Replace `YOUR-BACKEND-URL` with your backend address, **no trailing slash**. Keep `/api/:path*` at the end of the destination exactly as written.
   - Backend on your laptop through Cloudflare Tunnel: the address printed by `cloudflared tunnel --url http://localhost:5000`, e.g. `https://something-random.trycloudflare.com`.
   - Backend on Render / Railway / a VPS: that service address.
2. Push to GitHub and import the project in Vercel (root directory `frontend`, framework Vite, build `npm run build`, output `dist`). No environment variables are needed.
3. In the backend `.env` set `CLIENT_ORIGIN=https://your-site.vercel.app`, `NODE_ENV=production` (and `TRUST_PROXY_HOPS=2` when you use Vercel + Cloudflare Tunnel). Restart the backend.
4. The second rule makes refreshing pages like `/check` or `/report` work.
5. Test: open `https://your-site.vercel.app/api/health`. You should see `{"success":true,...}`.

### Using a laptop as the server
- The site works only while the laptop is on and both the backend (`npm start`) and `cloudflared` are running.
- A quick tunnel address **changes every time you restart cloudflared**. Update `vercel.json` and redeploy each time, or use a named Cloudflare Tunnel / a real host for a permanent address.

---

## Problems we solved (project history)

| # | Problem | Solution |
|---|---|---|
| 1 | Admin panel could not change a provider's model after creating it | Added the **Model** editor with **Load available models** and **Auto-pick best model**. |
| 2 | "Invalid request body" on **Run web research** | Frontend now sends an empty `{}` body instead of `null` (also for test and reset calls). |
| 3 | Provider test showed "Request timed out" | Longer timeouts for provider tests, checks (60 s) and fresh searches (95 s). |
| 4 | Models had to be loaded and typed by hand when adding a provider | Add form: leave **Model empty** for automatic choice, or press **Load models** to pick from a dropdown. Clear success and error messages. |
| 5 | White "Report a scam" button on a white background | Colours fixed. |
| 6 | Live search was login-only and looked the same for everyone | New **public live feed** (no login) with Latest and topic tabs; separate **Get current data now** card for logged-in users with their own search box. |
| 7 | The result disappeared when the page was reloaded | The last search is loaded from the user's account on page load. |
| 8 | Live search errors were unclear | Friendly messages for limit reached (429), nothing available (503), and a notice when a saved result is shown instead (search not counted). |
| 9 | Vercel site showed **"Route not found."** on login, check and the feed | `vercel.json` destination was missing `/api/:path*`. Fixed template and documented. |

## Troubleshooting

| What you see | Fix |
|---|---|
| **"Route not found."** on login, check, or any page | `/api/:path*` is missing at the end of the `destination` in `vercel.json`, or the tunnel address is old. Fix, commit, redeploy. |
| **"Cannot reach the server."** | Backend or tunnel is not running, or the address in `vercel.json` is old. |
| Live feed says "being prepared" | The backend has not researched yet. Admin, **Refresh live feed now**. |
| Login works locally but not on Vercel | Backend needs `NODE_ENV=production` and `CLIENT_ORIGIN` set to your Vercel address. |
| Fresh search says "not available" | No AI provider works right now. Admin, **Test all providers**. |

---

## Project structure
```
src/
  main.jsx, App.jsx              app start, routes, session restore
  api/                           client.js (axios), scamshield.js (all backend calls), auth.js
  context/AuthContext.jsx        logged-in user
  pages/                         HomePage, CheckPage, LookupPage, ReportPage
  components/
    home/                        LiveFeed (public), LiveScamSearch (personal), LiveResult (red/green answer)
    auth/                        LoginForm, RegisterForm, VerifyForm
    layout/ common/ ui/          navbar, route guards, small UI pieces
  admin/                         AdminDashboardPage, ProviderManager
```

## Notes
- The login token is stored as a cookie (and as a fallback in `localStorage`).
- Long requests (check, fresh search) use longer timeouts than the default 15 seconds.
- AI answers can be wrong: the app shows a disclaimer and always links to the news source.
