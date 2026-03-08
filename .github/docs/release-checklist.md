# PrayCalc Release Checklist

## v0.9.3 Release Checklist

### Pre-Release (AI — complete before handing to user)

- [x] All 71 AI tasks complete (or blocked with [FOR-USER] label)
- [x] Flutter analyze: 0 issues
- [x] Web TypeScript: 0 errors, 252 tests passing
- [x] Smart service TypeScript: 0 errors
- [x] macOS swift build: Build complete
- [x] Version numbers updated: `flutter/pubspec.yaml` → 0.9.3+1, `web/package.json` → 0.9.3
- [x] Changelog written: `.github/wiki/Changelog.md`
- [x] FEATURES.md updated: all platforms, 22 languages, correct statuses
- [x] C core sources mirrored into `macos/Sources/PrayCalcCore/`

### Server Setup (FOR-USER — requires Hetzner SSH access)

- [ ] SSH into ummat-prod (159.69.190.92)
- [ ] In Hasura console, run migrations to create tables:
  - `pc_webhook_registrations` (id, user_id, callback_url, lat, lng, timezone, events, active, created_at)
  - `pc_free_tier_usage` (identifier, date, count — PK: identifier+date)
  - `pc_integrations` (id, user_id, type, metadata, active, created_at)
  - `pc_devices` (id, user_id, name, type, metadata, active, created_at)
  - `pc_saved_locations` (id, user_id, lat, lng, timezone, is_home, label)
  - `pc_analytics_events` (id, page_path, event_name, locale, session_hash, props, created_at)
- [ ] Register PrayCalc remote schema in Hasura console → `https://praycalc.com/api/graphql`
- [ ] Rebuild + redeploy praycalc-smart container:
  ```bash
  cd ~/praycalc-smart
  git pull
  docker build -t praycalc-smart .
  docker stop praycalc-smart && docker rm praycalc-smart
  docker run -d --name praycalc-smart --env-file .env -p 4010:4010 praycalc-smart
  ```
- [ ] Set UptimeRobot monitors:
  - `https://smart.praycalc.com/health` (every 5 min)
  - `https://praycalc.com` (every 5 min)
  - `https://api.praycalc.com/v1/graphql` (every 5 min)
  - `https://auth.ummat.dev` (every 5 min)
- [ ] Add new env vars to smart service `.env`:
  - `APPLE_SHARED_SECRET=` (from App Store Connect → App → In-App Purchases)
  - `GOOGLE_SERVICE_ACCOUNT_KEY=` (JSON, from Google Play Console → API access)
  - `GOOGLE_PACKAGE_NAME=com.praycalc.app`

### Mobile App (FOR-USER)

- [ ] `shorebird release android` — new Android release build
- [ ] `shorebird release ios` — new iOS release build
- [ ] Run on iOS simulator — all tabs functional
- [ ] Run on Android physical device — all tabs functional
- [ ] App Store screenshots (physical iPhone)
- [ ] Play Store screenshots (physical Android)
- [ ] Submit to App Store (Apple App Store Connect)
- [ ] Submit to Play Store (Google Play Console)

### Web (FOR-USER)

- [ ] `git push origin main` → Vercel auto-deploys praycalc.com
- [ ] Verify praycalc.com loads and prayer times show
- [ ] Verify praycalc.org deploys correctly
- [ ] Test smart home OAuth flow end-to-end

### Desktop (FOR-USER)

- [ ] macOS: build release DMG, notarize with Apple
- [ ] Windows: `flutter build windows` → create NSIS installer or MSIX
- [ ] Linux: `flutter build linux` → create AppImage or .deb

### Smart Home (FOR-USER)

- [ ] Google Home: verify Action still passes certification
- [ ] Alexa: verify Skill passes certification
- [ ] Test webhook firing at prayer times

### Final (FOR-USER)

- [ ] Announce to user → say "v1.0" → AI creates git tag + GitHub Release
