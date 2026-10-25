# WISE - Social Media Web App

MERN stack: **React (Vite) + Material UI + Redux** frontend, **Node.js + Express + MongoDB (Mongoose)** backend.

Features: register / login (bcrypt + JWT), profile pictures, profiles with stats
(profile views, impressions), posts with caption + image / clip / audio / attachment,
home feed, like / unlike, comments, delete own posts, add / remove friends (mutual),
people search, notifications, editable social profiles, sponsored widget,
light / dark mode, responsive desktop + mobile layout.

## 1. Install once (Windows)

1. **Node.js LTS** (v18 or newer): https://nodejs.org
2. **MongoDB** - choose one:
   - **MongoDB Community Server** (local): https://www.mongodb.com/try/download/community
     (tick "Install MongoDB as a Service"). Default URL already in `.env.example`.
   - **MongoDB Atlas** (free cloud): create a cluster and paste your connection string into `MONGO_URL`.

## 2. Run (PowerShell)

Open PowerShell in the extracted project folder.

**Backend (window 1):**

```powershell
cd server
copy .env.example .env
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"   # copy the output
notepad .env                                                                # paste it as JWT_SECRET, save
npm install
npm run dev
```

You should see `WISE API running on http://localhost:3001`.

**Frontend (window 2):**

```powershell
cd client
npm install
npm run dev
```

Open **http://localhost:5173**, click "Sign Up here", create an account (a profile picture is required), then log in.

**Shortcut** (after the first `.env` setup): `powershell -ExecutionPolicy Bypass -File .\run.ps1`

### Troubleshooting

- *"running scripts is disabled"* when using npm:
  `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
- *MongoDB connection failed*: check the service is running (`Get-Service MongoDB`) or fix `MONGO_URL`.
- *Backend on another URL/port*: copy `client\.env.example` to `client\.env` and set `VITE_API_URL`;
  set `CLIENT_URL` in `server\.env` to the frontend address.

## Project structure

```
server/   index.js, models/, controllers/, routes/, middleware/, utils/, public/assets (uploads)
client/   src/{App.jsx, main.jsx, theme.js, api.js, state/, components/, scenes/{navbar,loginPage,homePage,profilePage,widgets}}
```

## API (all except register/login need `Authorization: Bearer <token>`)

| Method | Route | Purpose |
|---|---|---|
| POST | /auth/register | create account (multipart, `picture`) |
| POST | /auth/login | login, returns token + user |
| GET | /auth/me | current user |
| GET | /users/search?q= | search people |
| GET | /users/:id | profile (`?view=1` counts a profile view) |
| GET | /users/:id/friends | friend list |
| PATCH | /users/:id | edit own location, occupation, socials |
| PATCH | /users/:id/:friendId | add / remove friend |
| GET | /posts | feed |
| GET | /posts/user/:userId | a user's posts |
| GET | /posts/notifications | likes / comments on my posts |
| POST | /posts | create post (multipart, `description`, `media`) |
| PATCH | /posts/:id/like | like / unlike |
| POST | /posts/:id/comments | add comment |
| DELETE | /posts/:id | delete own post |

## Security notes

Passwords hashed with bcrypt (cost 12); JWT with expiry; secrets only in `.env` (never commit it);
uploads limited by type and size with server-generated file names; login/register rate-limited;
helmet + CORS restricted to `CLIENT_URL`.

---

# Putting the site online (free, ONE service)

The backend also serves the built website, so only one Render service is needed.
Accounts: **GitHub**, **MongoDB Atlas** (database), **Cloudinary** (photos/files), **Render** (hosting).

1. **Atlas**: free cluster -> Database Access: add user + password (letters/numbers only) ->
   Network Access: allow `0.0.0.0/0` -> Connect -> Drivers -> copy the string and add `/wise` before the `?`:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/wise?retryWrites=true&w=majority`
2. **Cloudinary**: sign up, copy Cloud name, API key, API secret.
   (If PDF/ZIP links do not open: Settings -> Security -> allow delivery of PDF and ZIP files.)
3. **GitHub**: upload this whole project to a new repository (`.env` files are git-ignored).
4. **Render** -> New -> Web Service -> pick the repo, then:
   - Root Directory: leave empty
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Instance Type: Free
   - Environment variables: `MONGO_URL`, `JWT_SECRET` (long random text), `JWT_EXPIRES_IN` = `7d`,
     `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
5. Wait for the deploy to finish, then open your `https://....onrender.com` link. That is your live website.

Free-tier note: the free service sleeps after 15 minutes idle; the first visit afterwards takes about a minute.
