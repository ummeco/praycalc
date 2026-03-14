# Smart Server Migrations

SQL migrations for the PrayCalc smart server (`smart/`). Applied to the shared Ummat PostgreSQL
database on Hetzner (ummat-prod, `159.69.190.92`) via `nself migrate run` or manually via `psql`.

## Ordering

Migrations are applied in numeric order. **Never re-number or remove an existing migration.**
Add new migrations with the next sequential number.

## Numbering History

| File | Created | Notes |
| --- | --- | --- |
| `001_subscriptions.sql` | 2026-02-xx | Subscription tiers and billing |
| `002_smart_home_devices.sql` | 2026-02-xx | Smart home device registry |
| `003_oauth_tokens.sql` | 2026-02-xx | OAuth device flow tokens |
| `004_user_settings.sql` | 2026-03-13 | User prayer settings (filled gap) |
| `005_tv_devices.sql` | 2026-03-08 | TV Command Center tables |
| `006_agendas.sql` | 2026-03-xx | Prayer agenda events |
| `007_digest_subscribers.sql` | 2026-03-xx | Email digest subscription |
| `008_pc_sessions.sql` | 2026-03-xx | Session management |
| `009_tv_shares.sql` | 2026-03-13 | TV device sharing |
| `010_free_tier_usage.sql` | 2026-03-13 | Free-tier daily usage counters |

> **Gap note:** Migration 004 (`user_settings`) was created after 005 (`tv_devices`).
> The gap existed because user settings were initially stored in-app only. Migration 004
> fills this gap for completeness — it does not depend on 005 and can be applied in any order
> relative to it, as long as `umm_user_profiles` already exists (created outside this series).

## Applying Migrations

```bash
# Via nSelf CLI (preferred)
cd ~/Sites/ummeco/ummat/backend
nself migrate run

# Manually via psql
psql "$DATABASE_URL" -f smart/migrations/004_user_settings.sql
```

## Prerequisites

All migrations assume `umm_user_profiles` table exists (created by Hasura Auth / ummat backend
migrations, not by this series). The `update_updated_at_column()` trigger function is created
in `005_tv_devices.sql` and reused by later migrations.
