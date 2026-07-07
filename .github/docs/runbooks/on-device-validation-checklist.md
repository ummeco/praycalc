# On-Device Validation Checklist — First EAS/TestFlight Build

This is the manual test pass for the first real build off the EAS pipeline (TestFlight on iOS,
internal track on Android). Nothing here can be automated — it requires a physical device, a real
notification schedule, and in some cases waiting through real time. Run it once per real device
family (a modern iPhone + a modern Android phone at minimum) before promoting a build past internal
testers.

Do not skip an item because "it probably still works" — every item here has broken at least once
in this app's history for a reason a simulator or unit test could not catch.

---

## 0. Before you start

- [ ] Install the build via TestFlight (iOS) or the internal testing link (Android) — not `expo start`, not a dev client. This must be the real signed binary.
- [ ] Grant notification permission when prompted (do not pre-deny it to "test the denied path" yet — that's a separate pass).
- [ ] Set a real location (city search or GPS) so prayer times are non-trivial.
- [ ] Leave the device otherwise idle/normal — don't run a battery saver or Do Not Disturb mode that would mask a real failure as a pass.

---

## 1. Adhan notification fires with takbir/adhan sound (Android channel)

**Steps:**
1. In Settings, enable full adhan sound for at least one prayer.
2. On Android, check that a separate "Adhan" notification channel exists (Settings → Apps → PrayCalc → Notifications) distinct from the default channel.
3. Set the next prayer time a few minutes out, lock the phone, wait.

**Expected:** Notification fires at prayer time, plays the adhan/takbir sound (not the default system tone), and on Android shows under the dedicated adhan channel with its own sound + importance settings.

- [ ] Pass / [ ] Fail — notes: ___________

---

## 2. Full adhan on tap

**Steps:**
1. When the adhan notification arrives, tap it (don't dismiss it).

**Expected:** App opens and plays the full adhan audio (not just the notification chime) from the beginning, with visible play/stop controls.

- [ ] Pass / [ ] Fail — notes: ___________

---

## 3. Advance reminder default chime

**Steps:**
1. Enable the "remind me before prayer" setting with the default lead time.
2. Wait for the reminder to fire ahead of the actual prayer time.

**Expected:** A separate, shorter notification fires at the configured lead time, using the default chime (not the adhan sound), clearly distinguishable from the adhan notification itself.

- [ ] Pass / [ ] Fail — notes: ___________

---

## 4. Iqamah reminder

**Steps:**
1. In Settings, set an iqamah offset (minutes after adhan) to a small non-zero value (e.g. 5 min).
2. Let a prayer's adhan notification fire, then wait out the offset.

**Expected:** A second notification fires exactly the configured number of minutes after the adhan notification, labeled as the iqamah reminder (not a duplicate adhan). Setting the offset to 0 disables it entirely — verify no second notification fires in that case.

- [ ] Pass / [ ] Fail — notes: ___________

---

## 5. Reboot survival

**Steps:**
1. With notifications scheduled for the day, restart the phone fully (power off, power on — not just lock/unlock).
2. Do not open the app after reboot.
3. Wait for the next scheduled prayer time to pass.

**Expected:** The notification still fires without the app having been manually reopened. iOS and Android both reschedule local notifications independently of app launch, but this must be verified on-device — a scheduling bug can silently drop everything on reboot.

- [ ] Pass / [ ] Fail — notes: ___________

---

## 6. Background reschedule after 3+ days closed (simulated via device date change)

**Steps:**
1. Force-quit the app (swipe away from the app switcher, not just backgrounding).
2. Advance the device's system date forward by 3-4 days (Settings → Date & Time → disable automatic, set manually).
3. Without opening the app, wait for or check whether a prayer notification fires on the new date.
4. Open the app and confirm the displayed prayer times match the new (simulated) date.

**Expected:** Either the background task has silently rescheduled notifications for the new date range, or the app self-heals its schedule the moment it's opened — no stale notifications for the old date, no gap where nothing is scheduled. This is the highest-risk item on this list; iOS background task budgets are not guaranteed, so a graceful catch-up on next app open is the real acceptance bar even if the pure-background path is best-effort.
5. Reset the device date back to automatic/current before continuing.

- [ ] Pass / [ ] Fail — notes: ___________

---

## 7. Android home screen widget

**Steps:**
1. Long-press the home screen → Widgets → add the PrayCalc widget.
2. Confirm it shows the correct next prayer name and countdown/time.
3. Change a setting that affects prayer times (e.g. calculation method, or location) inside the app.
4. Return to the home screen without force-closing the app.

**Expected:** Widget renders immediately on add with correct data (no blank/loading state stuck). After the settings change, the widget updates to reflect the new calculation within a reasonable time (does not require manually removing/re-adding the widget).

- [ ] Pass / [ ] Fail — notes: ___________

---

## 8. Dark / light / system theme

**Steps:**
1. Set the app's theme setting to Light — confirm all screens (home, settings, timetable, mosques, Qibla) render with light colors and readable contrast.
2. Set to Dark — same check.
3. Set to System, then toggle the OS-level appearance (iOS Settings → Display, Android Settings → Display) while the app is open and while it's backgrounded.

**Expected:** No screen is stuck in the wrong theme; no unreadable text (dark text on dark background or vice versa); System mode follows the OS live, including switching while backgrounded then foregrounded.

- [ ] Pass / [ ] Fail — notes: ___________

---

## 9. RTL locale (Arabic) restart flow

**Steps:**
1. Set the app language to Arabic (ar) in Settings.
2. Force-quit and relaunch the app (RTL layout mirroring in RN often requires a restart to fully apply).
3. Walk through onboarding-adjacent screens, home, settings, and at least one modal/sheet.

**Expected:** Layout mirrors correctly (nav icons, text alignment, swipe directions where applicable); no clipped or overlapping text; the restart prompt (if the app shows one for RTL) actually applies the change rather than silently no-op-ing.

- [ ] Pass / [ ] Fail — notes: ___________

---

## 10. Travel mode end-to-end

**Steps:**
1. Enable travel mode.
2. Change location to a different city/timezone (simulate travel via city search or mock GPS).
3. Confirm prayer times, Qibla direction, and notifications all update to the new location.
4. Disable travel mode and confirm the app reverts to the home location's settings.

**Expected:** No stale prayer times from the original location; Qibla direction recalculates; notification schedule updates to the new location's times without needing an app restart.

- [ ] Pass / [ ] Fail — notes: ___________

---

## 11. City search offline (airplane mode)

**Steps:**
1. Enable airplane mode.
2. Open city search and attempt to search for a new city.

**Expected:** A clear offline/error state is shown (no infinite spinner, no crash). If the city list has any offline/cached fallback, verify it still works; otherwise verify the error message is honest about needing connectivity, and that previously-selected locations still work fully offline.

- [ ] Pass / [ ] Fail — notes: ___________

---

## 12. Calendar (.ics) export

**Steps:**
1. From the timetable screen, export the monthly schedule as `.ics`.
2. Open the exported file in the device's native calendar app (or AirDrop/share it to a calendar app).

**Expected:** File opens and imports cleanly; prayer time entries appear on the correct dates/times in the calendar app; no malformed/duplicate events.

- [ ] Pass / [ ] Fail — notes: ___________

---

## 13. Mosque finder

**Steps:**
1. Open the mosque finder with location permission granted.
2. Confirm nearby mosques list populates with distance and name.
3. Tap a result and confirm it opens directions/details correctly.
4. Deny location permission (fresh install or reset permission) and reopen — confirm a sane fallback (manual location entry or clear prompt), not a crash.

**Expected:** Real nearby results for a populated area; graceful degradation without location permission.

- [ ] Pass / [ ] Fail — notes: ___________

---

## 14. TV pairing (with the TV app)

**Steps:**
1. Have the PrayCalc TV app running on the same network (Apple TV / Android TV).
2. From the mobile app's pairing screen, initiate pairing (QR/code, whichever flow ships).
3. Confirm the TV app receives and displays the pairing confirmation.
4. Confirm settings/state sync from mobile to TV (or whichever direction is implemented) actually reflects on the TV screen.

**Expected:** Pairing completes without a manual network config step; the TV app reflects the paired mobile app's data.

- [ ] Pass / [ ] Fail — notes: ___________

---

## 15. IAP sandbox purchase + restore

**Steps:**
1. Using a sandbox/test Apple ID (iOS) or a license-tester Google account (Android), open the subscription screen.
2. Complete a sandbox purchase.
3. Confirm the app immediately unlocks the paid entitlement (no restart required).
4. Delete and reinstall the app (or sign out/in), then use "Restore Purchases."

**Expected:** Purchase completes and unlocks entitlement without needing an app restart; restore correctly re-unlocks the same entitlement on a fresh install without a second charge.

- [ ] Pass / [ ] Fail — notes: ___________

---

## Sign-off

| Field | Value |
|---|---|
| Build number tested | |
| Device(s) used | |
| Tester | |
| Date | |
| Overall result | [ ] All pass  [ ] Pass with noted exceptions  [ ] Blocking failures found |

Any failed item blocks promotion past internal testing until fixed and re-verified on this same checklist.
