# PrayCalc Mobile — Translator Kit

This document is the complete briefing for human translators contributing to the PrayCalc
mobile app (`mobile/src/i18n/`). Read it fully before opening any locale file.

---

## Current Coverage

The app has 729 translatable string keys (source of truth: `en.json`). The table below shows
real key counts as of the last automated measurement (see `translation-status.csv` in this
folder for the machine-readable version).

| Locale | Language | Translated | Missing | % Done | Status |
|--------|----------|-----------|---------|--------|--------|
| ar | Arabic | 729 | 0 | 100% | AI-complete — native review welcome |
| ur | Urdu | 729 | 0 | 100% | AI-complete — native review welcome |
| fr | French | 729 | 0 | 100% | AI-complete — native review welcome |
| tr | Turkish | 729 | 0 | 100% | AI-complete — native review welcome |
| id | Indonesian | 729 | 0 | 100% | AI-complete — native review welcome |
| ms | Malay | 729 | 0 | 100% | AI-complete — native review welcome |
| bn | Bengali | 729 | 0 | 100% | AI-complete — native review welcome |
| sw | Swahili | 729 | 0 | 100% | AI-complete — native review welcome |
| es | Spanish | 729 | 0 | 100% | AI-complete — native review welcome |
| de | German | 729 | 0 | 100% | AI-complete — native review welcome |
| nl | Dutch | 729 | 0 | 100% | AI-complete — native review welcome |
| pt | Portuguese | 729 | 0 | 100% | AI-complete — native review welcome |
| it | Italian | 729 | 0 | 100% | AI-complete — native review welcome |
| ru | Russian | 729 | 0 | 100% | AI-complete — native review welcome |
| hi | Hindi | 729 | 0 | 100% | AI-complete — native review welcome |
| ps | Pashto | 729 | 0 | 100% | AI-complete — native review welcome |
| fa | Farsi/Persian | 729 | 0 | 100% | AI-complete — native review welcome |
| so | Somali | 729 | 0 | 100% | AI-complete — native review welcome |
| ha | Hausa | 729 | 0 | 100% | AI-complete — native review welcome |
| yo | Yoruba | 729 | 0 | 100% | AI-complete — native review welcome |

**Status as of 2026-07-11:** every locale carries full 729/729 key coverage, produced by an
AI translation pass (owner-authorized) that preserved all pre-existing human translations
verbatim, kept every `{{placeholder}}` token intact, and used each language's established
Islamic terminology (Ahl us-Sunnah mainstream register; contested renderings avoided — see
`../src/i18n/REVIEW.md`). The iOS permission strings in `mobile/locales/native/` are
translated for all 20 locales as well.

**What translators should do now:** native-speaker *review* rather than initial translation.
Read your locale file end to end against `en.json`, fix anything unnatural, and pay special
attention to the `notifications.*` namespace (lock-screen strings) and the fiqh-sensitive
strings listed in the REVIEW.md checklist. The verification commands below still apply to
review edits.

---

## File Format

Every locale is a single JSON file at `mobile/src/i18n/<locale>.json`. The structure is a
nested object, mirroring `en.json` exactly.

```jsonc
{
  "app": {
    "name": "PrayCalc"          // translate "PrayCalc" only if the locale has a conventional
  },                             // transliteration; otherwise keep it as-is
  "prayer": {
    "fajr": "Fajr",             // prayer names: transliterate, do not translate the meaning
    "dhuhr": "Dhuhr",
    "asr":   "Asr",
    "maghrib": "Maghrib",
    "isha":  "Isha"
  },
  "notifications": {
    "prayerTime": "{{prayer}} Time",  // see Placeholder Rules below
    ...
  },
  ...
}
```

**Your deliverable:** a single updated `<locale>.json` file per locale, with all new keys
added while all pre-existing keys are left untouched.

---

## Placeholder Rules

Strings containing `{{...}}` are interpolated at runtime. You MUST:

1. **Keep every placeholder exactly as written** — including the double curly braces and the
   exact variable name inside them.
2. **Reorder placeholders within the sentence** as the target language grammar requires.
   For example, if Arabic word order puts `{{prayer}}` after the time, reorder accordingly.
3. **Never translate the placeholder name itself** (`{{prayer}}` stays `{{prayer}}`, not
   `{{salah}}` or `{{وقت}}`).

Examples:

| Key | English source | Notes |
|-----|---------------|-------|
| `notifications.prayerTime` | `{{prayer}} Time` | `{{prayer}}` will be substituted with the prayer name (e.g. "Fajr") |
| `notifications.bodyNow` | `It's time for {{prayer}} prayer — {{time}}` | Both `{{prayer}}` and `{{time}}` must appear |
| `notifications.bodyAdvance_one` | `{{prayer}} is in {{count}} minute — {{time}}` | Pluralization variant (singular) |
| `notifications.bodyAdvance_other` | `{{prayer}} is in {{count}} minutes — {{time}}` | Pluralization variant (plural) |
| `common.offlineShowingCachedFrom` | `You're offline. Showing data from {{cachedAt}}.` | `{{cachedAt}}` is a formatted date string |

### Pluralization keys

Keys ending in `_one` and `_other` (and sometimes `_zero`, `_two`, `_few`, `_many`) are
plural forms. Supply all forms required by the target language's plural rules. English only
uses `_one` and `_other`. Arabic requires `_zero`, `_one`, `_two`, `_few`, `_many`, and
`_other`. If your locale needs fewer forms than English, supply at least `_other`. If it
needs more, add the additional suffixes — the i18n library (`i18next`) will use them.

---

## Islamic Content Review Gate (Hard Rule)

The following categories of content **must not be machine-translated** and **must have
qualified scholar or qualified Islamic-studies translator review** before merging. Getting
fiqh nuance wrong in a translation is a release-blocking defect.

| What | Why |
|------|-----|
| `screens.travel.musafirAlertBody` | Fiqh ruling on qasr (shortening prayers while travelling) — madhab differences exist; a mistranslation could mislead users about their obligation |
| `screens.travel.fiqhNote` | Same — references jama (combining prayers), which has different rulings by madhab |
| `screens.ramadan.laylatAlQadrBody` | Guidance on the last ten nights of Ramadan — religious significance, not generic UI |
| `screens.moon.ramadanNote` | Statement about Ramadan and fasting obligation |
| `screens.moon.dhulHijjahNote` | Statement about the virtuous first ten days of Dhul Hijjah |
| `screens.fasting.sunnahSourceNote` | Hadith citation text (Sahih Muslim 1162; Sunan an-Nasa'i 2345; Abu Dawud 2449) — translate faithfully, do not paraphrase the citations |
| `screens.qada.fiqhNote` | Fiqh ruling on qada (making up missed prayers) and the menstruation/prayer-vs-fast qada distinction |
| `screens.qada.fiqhCitation` | Sahih al-Bukhari 321 · Sahih Muslim 335 — keep citation references intact |
| `screens.qada.consultScholar` | Instruction to consult a scholar — must convey the same advisory tone |

**What NOT to touch at all** (these are not in the JSON catalogs and must stay in the source
code in Arabic/English only):

- Dua and dhikr text, transliteration, translation, and source citations (hardcoded in
  `src/features/dua-dhikr/data/adhkar.ts` and related TSX files) — Hisn al-Muslim /
  Sahih Bukhari+Muslim citations; never extracted to catalogs.
- Quran text and translations (hardcoded in `src/data/verses.ts` and surah metadata) —
  verified against the Uthmani mushaf; do not alter.

For safe generic UI strings (button labels, empty states, loading messages, tab labels) in
the `screens.*` namespace: a qualified translator without specific Islamic scholarship is
sufficient, but the translator should be a native speaker and ideally a Muslim familiar
with prayer terminology.

---

## Glossary (Do Not Translate These Terms)

The following are proper nouns or established Islamic transliterations used consistently
throughout the app. Use them as-is, regardless of locale:

| Term | Notes |
|------|-------|
| PrayCalc | Product name — do not translate |
| Ummat+ | Subscription tier name — do not translate |
| Fajr, Dhuhr, Asr, Maghrib, Isha | Standard prayer names — transliterate to your script if needed, do not translate the meaning |
| Qibla | Direction of prayer — standard Islamic term |
| Hijri | Islamic calendar system — retain this English transliteration |
| Muharram, Safar, ... Dhul Hijjah | Hijri month names — retain standard transliterations |
| Adhan, Iqamah | Call to prayer / second call — standard Islamic terms |
| Madhab | School of Islamic jurisprudence — retain; do not translate |
| Qasr, Jama | Shortened/combined travel prayers — fiqh terms; retain; see Islamic Content Gate above |
| Qada | Missed-prayer makeup — fiqh term; retain |
| Laylat al-Qadr | Night of Decree — retain standard transliteration |
| Tarawih | Ramadan night prayers — retain standard transliteration |
| Tasbeeh | Counting dhikr — retain standard transliteration |
| Dhikr, Dua | Remembrance / supplication — retain standard transliterations |

---

## What to Translate First (Priority Order)

If you're translating a new locale from scratch, work in this order:

1. **`notifications.*`** — these strings appear on the iOS/Android lock screen outside the
   app. P0 for ar/ur, and high-priority for all locales.
2. **`tabs.*`** — bottom navigation tab labels (Prayers, Prayer Times, Qibla, Calendar,
   More). Visible immediately on launch.
3. **`common.*` keys not yet translated** — generic button and state labels used across
   many screens.
4. **`menu.*`** — More-tab menu item labels.
5. **`settings.*`** — settings screen labels.
6. **`screens.*`** — per-screen strings. Tackle one screen at a time. Start with the most-
   used screens: `screens.prayerTimes.*`, `screens.qibla.*`, `screens.onboarding.*`.
7. **Fiqh-flagged `screens.*` keys last** — these require the scholar review gate.

---

## Hand-Back Process

1. **Work on your locale file only** (`mobile/src/i18n/<locale>.json`). Do not modify
   `en.json` or any other locale file.

2. **Validate JSON before submitting.** Run:
   ```
   python3 -c "import json; json.load(open('mobile/src/i18n/<locale>.json'))"
   ```
   A silent exit (no output) means valid. Any error means the file is malformed.

3. **Mark scholar-review keys clearly** if you are not a qualified Islamic scholar yourself.
   Add a temporary sibling key `"<key>__NEEDS_SCHOLAR_REVIEW": true` (the app ignores unknown
   keys). The engineering team will confirm review before release.

4. **Open a pull request** against `main` in `ummeco/praycalc`. Title format:
   `i18n(<locale>): translate <N> keys — <namespace list>`.
   Example: `i18n(fr): translate 47 keys — notifications, tabs, common`.

5. **PR description must include:**
   - Locale and language name
   - List of namespaces translated
   - Confirmation that placeholder `{{...}}` patterns were preserved (or note any differences)
   - Confirmation of scholar review for any fiqh-flagged keys, or note that those keys were
     skipped and marked for review
   - Whether any keys were intentionally left untranslated (with reason)

6. **Engineering review:** a project maintainer will verify placeholder consistency and
   trigger the Islamic-content review gate for fiqh-flagged keys before merging.

---

## Verification Command

After saving your locale file, verify the whole catalog is valid JSON and count your progress:

```bash
python3 - <<'EOF'
import json, os

def count_keys(obj, prefix=''):
    keys = set()
    if isinstance(obj, dict):
        for k, v in obj.items():
            full = f'{prefix}.{k}' if prefix else k
            keys |= count_keys(v, full)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            keys |= count_keys(v, f'{prefix}[{i}]')
    elif isinstance(obj, str):
        keys.add(prefix)
    return keys

i18n_dir = 'mobile/src/i18n'
en_keys = count_keys(json.load(open(os.path.join(i18n_dir, 'en.json'))))

locale = '<your-locale>'   # e.g. 'fr'
loc_keys = count_keys(json.load(open(os.path.join(i18n_dir, f'{locale}.json'))))
translated = len(en_keys & loc_keys)
missing = len(en_keys) - translated
print(f'{locale}: {translated}/{len(en_keys)} keys translated ({round(translated/len(en_keys)*100,1)}%), {missing} missing')
EOF
```

---

## See Also

- `mobile/src/i18n/REVIEW.md` — detailed per-key coverage table, the Hard Content Gate
  rationale, and the full list of fiqh-flagged keys
- `mobile/src/i18n/en.json` — source of truth (729 keys as of 2026-07-11)
- `mobile/docs/translation-status.csv` — machine-readable coverage table (auto-generated)
