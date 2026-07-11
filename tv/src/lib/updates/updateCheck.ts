/**
 * Purpose: Checks GitHub Releases for a newer `tv-v*`-tagged praycalc TV release than the
 *   one currently running. Store builds (Play/Fire TV) update themselves — this never
 *   auto-installs anything; it only surfaces a "there's a newer build" signal so the
 *   dashboard can show a dismissible toast pointing at praycalc.com/tv.
 * Inputs: currentVersion ("X.Y.Z", no 'v'/'tv-v' prefix — see appVersion.ts).
 * Outputs: UpdateCheckResult { updateAvailable, latestTag }.
 * Constraints: never throws — offline/network/parse errors resolve to "no update
 *   available" so the dashboard never surfaces an error toast for this. Draft and
 *   prerelease GitHub releases are ignored. Non tv-v* tags (web/desktop/mobile releases
 *   sharing the same repo) are ignored.
 * SPORT: praycalc/tv lib/updates
 */

const RELEASES_URL = 'https://api.github.com/repos/ummeco/praycalc/releases';

export interface GithubRelease {
  tag_name: string;
  draft?: boolean;
  prerelease?: boolean;
}

export interface UpdateCheckResult {
  updateAvailable: boolean;
  /** The newest tv-v* tag found, or null when none exists / nothing is newer. */
  latestTag: string | null;
}

/** A [major, minor, patch] tuple used for ordering comparisons. */
export type VersionTuple = [number, number, number];

/** Parses a `tv-v1.2.3` release tag into a version tuple, or null if it doesn't match. */
export function parseTvVersionTag(tag: string): VersionTuple | null {
  const m = /^tv-v(\d+)\.(\d+)\.(\d+)$/.exec(tag);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** Compares two version tuples: negative if a<b, 0 if equal, positive if a>b. */
export function compareVersions(a: VersionTuple, b: VersionTuple): number {
  for (let i = 0; i < 3; i += 1) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

/**
 * Finds the highest-versioned tv-v* tag among `releases`, ignoring drafts, prereleases,
 * and tags that don't match the tv-v major.minor.patch shape (e.g. web/desktop tags).
 */
export function findLatestTvRelease(releases: GithubRelease[]): string | null {
  let latestTag: string | null = null;
  let latestVer: VersionTuple | null = null;
  for (const r of releases) {
    if (r.draft || r.prerelease) continue;
    const ver = parseTvVersionTag(r.tag_name);
    if (!ver) continue;
    if (!latestVer || compareVersions(ver, latestVer) > 0) {
      latestVer = ver;
      latestTag = r.tag_name;
    }
  }
  return latestTag;
}

/** True when `latestTag` (e.g. "tv-v1.3.0") is strictly newer than `currentVersion` (e.g. "1.2.0"). */
export function isNewerVersion(latestTag: string, currentVersion: string): boolean {
  const latest = parseTvVersionTag(latestTag);
  const currentMatch = /^(\d+)\.(\d+)\.(\d+)/.exec(currentVersion);
  if (!latest || !currentMatch) return false;
  const current: VersionTuple = [
    Number(currentMatch[1]),
    Number(currentMatch[2]),
    Number(currentMatch[3]),
  ];
  return compareVersions(latest, current) > 0;
}

/**
 * Fetches GitHub releases and reports whether a newer tv-v* release exists. Never
 * throws — any network/HTTP/parse failure resolves to { updateAvailable: false,
 * latestTag: null } so callers can call this on a timer without try/catch.
 */
export async function checkForUpdate(currentVersion: string): Promise<UpdateCheckResult> {
  try {
    const res = await fetch(RELEASES_URL, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return { updateAvailable: false, latestTag: null };
    const releases = (await res.json()) as GithubRelease[];
    const latestTag = findLatestTvRelease(releases);
    if (!latestTag) return { updateAvailable: false, latestTag: null };
    return { updateAvailable: isNewerVersion(latestTag, currentVersion), latestTag };
  } catch {
    return { updateAvailable: false, latestTag: null };
  }
}
