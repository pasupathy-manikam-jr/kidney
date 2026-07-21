# Demo Data

One demo account, seeded by [`database/seeders/DemoSeeder.php`](../database/seeders/DemoSeeder.php).
**All data is fictional** — for walkthroughs only. Real tracking = register a fresh account.

## Account

| | |
|---|---|
| Email | `demo@example.com` |
| Password | `password` |
| Name | Demo Patient |

## Data: 63 readings

9 metrics × 7 monthly checkpoints (Jan 15 → Jul 15, 2026), oldest → newest:

| Metric | Series | End state |
|---|---|---|
| eGFR | 52 → 41 | declining → **G3b** |
| UACR (albuminuria) | 45 → 150 | rising → **A2** |
| Creatinine | 1.5 → 1.9 | rising |
| BUN | 24 → 30 | rising |
| Potassium | 4.6 → 5.3 | drifting high |
| Phosphorus | 3.8 → 4.8 | rising |
| Systolic BP | 138 → 150 | high |
| Diastolic BP | 86 → 93 | high |
| Weight | 78 → 75.4 | slow drop |

Designed so the dashboard lights up: **GFR card = G3b**, **risk map = very high** (G3b × A2),
tiles show upward trends + sparklines.

## Behavior

- Touches only the `demo@example.com` user.
- `updateOrCreate` + `labResults()->delete()` first → reseeding is a clean replace, no duplicates.
- **Not** wired into `DatabaseSeeder` — won't run on a plain `db:seed` or `migrate:fresh --seed`
  unless you add it there.

## Reseed

```bash
php artisan db:seed --class=DemoSeeder
```
