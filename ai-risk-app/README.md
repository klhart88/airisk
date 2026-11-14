# AI Risk Competency — Phase 1 (learning tracker)

A personal web app for the 8-week Enterprise AI Risk, Governance & Audit Readiness program.
Phase 1 covers the learning side: weekly objectives, readings, self-checks, "explain it" and
teach-back prompts, reflection log, spaced review queue, competency tracker, and backup.
It syncs between your devices through Supabase.

Plain static files: no build step, no server code.

## What's in the folder

| Path | What it is |
| --- | --- |
| `index.html` | The app page |
| `css/app.css` | Styles (light and dark mode) |
| `js/config.js` | **Your Supabase details go here** |
| `js/content.js` | Program content (weeks, objectives, readings, self-check questions). Edit to change what the app shows |
| `js/store.js` | Local storage and Supabase sync |
| `js/app.js` | Screens and behavior |
| `js/vendor/supabase.js` | Supabase client library (bundled, so no outside script is loaded) |
| `sw.js`, `manifest.webmanifest`, `icons/` | Offline support and home-screen install |
| `supabase/schema.sql` | Database table and privacy rules |

## Setup (about 15 minutes)

### 1. Create the database

1. In Supabase, create a new project (or reuse one — the table name `app_records` won't clash with most apps).
2. Open **SQL Editor > New query**, paste the contents of `supabase/schema.sql`, and click **Run**.
3. Open **Authentication > Providers** and confirm **Email** is enabled.
   - Optional: in the Email provider settings, turn off **Confirm email** if you don't want a confirmation email when you create your account.
4. Open **Authentication > URL Configuration** and set **Site URL** to the address where you'll host the app (for example `https://airisk.smartiqrealty.com`). This is where confirmation links send you.

### 2. Connect the app

Open **Project Settings > API** in Supabase and copy:
- **Project URL** → `supabaseUrl` in `js/config.js`
- **anon public** key → `supabaseAnonKey` in `js/config.js`

The anon key is designed to be public. The privacy rules in `schema.sql` ensure only your
signed-in account can read or write your rows. Never put the `service_role` key in the app.

### 3. Deploy

Upload the whole folder, unchanged in structure, to any static host — the same way as your
other smartiqrealty.com tools. It must be served over **https** for offline support and
home-screen install to work.

### 4. First use

1. Open the app on your personal laptop. Go to **Settings > Sync** and click **Create account**,
   then sign in.
2. Set your **program start date** in Settings.
3. On your iPhone, open the same address in Safari, tap **Share > Add to Home Screen**, then
   open it from the home screen and sign in with the same account.
4. On your company laptop, open the address and try signing in. If the network blocks Supabase,
   the sync chip will show an error; the app still works on that device but won't share data.

## How sync works

- Every change is saved on the device first, so the app works offline.
- About 2 seconds after a change (and every minute, and when you return to the app) it pushes
  changes to Supabase and pulls changes from your other devices.
- If the same item was edited on two devices, the most recent edit wins.
- The chip in the top bar shows status: **Synced**, **Syncing…**, **Offline**, **Not signed in**,
  **Sync error** or **Local only** (no Supabase details in `config.js`).

## Backup

**Settings > Backup > Download backup** saves everything to a `.json` file. **Restore from file**
merges a backup back in (newer entries win). Keep a backup after each week.

## Updating the app later

After you upload changed files, open `sw.js` and change `VERSION` (for example to `airisk-v2`)
so devices pick up the new version. Devices update on the next open after that.

## What's next

- **Phase 2:** portfolio templates for Artifacts 1–6, AI dependency inventory, capstone workspace,
  Word and Excel exports.
- **Phase 3:** guided learning assistant and the Quick Response Advisor (your own API key, stored
  only on the device; built as a separate module so it can later become a standalone HTML file).
