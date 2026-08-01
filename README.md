# Kidney-Love

A personal web app for tracking kidney health over time — lab results,
medications, diet & fluid, symptoms, and dialysis care — so you can see the
trends, understand where your numbers sit on the standard **KDIGO** risk map,
and walk into each appointment with a clear picture instead of a pile of paper.

> [!IMPORTANT]
> **Not medical advice.** Kidney-Love is a personal tracking tool. It does
> **not** diagnose anything and is **not** a substitute for professional care.
> Reference ranges and suggested limits shown are general adult values and vary
> by lab, age and sex. Always confirm every result and target with your lab
> report and your care team.

## Features

- **Dashboard** — your latest numbers, trends, and where eGFR/albuminuria place
  you on the KDIGO heat map (G/A staging) at a glance.
- **Lab results** — record eGFR, UACR, creatinine, BUN, potassium, phosphorus
  and more; see each metric trend over time; import and export your history.
- **Medications** — keep a current medication list with doses.
- **Diet & fluid** — log intake against daily targets (fluid, sodium, etc.).
- **Symptoms** — track how you feel over time alongside the numbers.
- **Dialysis (peritoneal)** — catheter details plus an exit-site / care log.
- **Appointments** — upcoming visits, with prep in mind.
- **Printable report** — a clean summary to bring to your clinic.
- **Emergency info** — key details to hand over quickly when it matters.
- **Share with a caregiver** — grant a family member or care team member
  read access to your data, and revoke it any time.
- **Reminders** — opt-in web-push notifications.
- **Your data, your control** — export/backup, light/dark theme, unit choices.

A read-only **demo account** (`demo@example.com` / `password`) is seeded with
fictional data for a walkthrough — see [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md)
and [`docs/DEMO_DATA.md`](docs/DEMO_DATA.md).

## Tech stack

- **Laravel 13** (PHP 8.3) + **Inertia.js** with a **React + TypeScript** front end
- **Tailwind CSS**, built with **Vite**
- **Laravel Fortify** authentication, including **passkeys**
- **Web Push** notifications
- **SQLite** by default (any Laravel-supported database works)
- Tested with **Pest**

## Getting started

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite   # default SQLite database
php artisan migrate --seed        # --seed loads the demo account
npm run dev                       # Vite dev server
php artisan serve                 # app server
```

Then open the app, click **Get started** to register, or sign in with the demo
account above to look around first.

## License

MIT — provided as-is, with no warranty, for personal use. See the disclaimer
above: Kidney-Love is not medical advice.
