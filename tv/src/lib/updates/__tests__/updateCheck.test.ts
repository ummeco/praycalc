/**
 * Purpose: Verify version-tag parsing/comparison, latest-release selection, and that
 *   checkForUpdate never throws (network mocked, no real fetch).
 * SPORT: praycalc/tv lib/updates tests
 */

import {
  parseTvVersionTag,
  compareVersions,
  findLatestTvRelease,
  isNewerVersion,
  checkForUpdate,
  GithubRelease,
} from '../updateCheck';

describe('parseTvVersionTag', () => {
  it('parses a valid tv-v tag', () => {
    expect(parseTvVersionTag('tv-v1.2.3')).toEqual([1, 2, 3]);
  });

  it('rejects non tv-v tags (other surfaces share this repo)', () => {
    expect(parseTvVersionTag('web-v1.2.3')).toBeNull();
    expect(parseTvVersionTag('v1.2.3')).toBeNull();
    expect(parseTvVersionTag('1.2.3')).toBeNull();
    expect(parseTvVersionTag('tv-v1.2')).toBeNull();
  });
});

describe('compareVersions', () => {
  it('orders by major, then minor, then patch', () => {
    expect(compareVersions([1, 0, 0], [1, 0, 0])).toBe(0);
    expect(compareVersions([2, 0, 0], [1, 9, 9])).toBeGreaterThan(0);
    expect(compareVersions([1, 0, 0], [1, 1, 0])).toBeLessThan(0);
    expect(compareVersions([1, 2, 3], [1, 2, 2])).toBeGreaterThan(0);
  });
});

describe('findLatestTvRelease', () => {
  it('picks the highest tv-v* tag, ignoring drafts/prereleases/non-tv tags', () => {
    const releases: GithubRelease[] = [
      { tag_name: 'tv-v1.0.0' },
      { tag_name: 'tv-v1.3.0' },
      { tag_name: 'tv-v1.2.0' },
      { tag_name: 'tv-v2.0.0', draft: true },
      { tag_name: 'tv-v1.9.0', prerelease: true },
      { tag_name: 'web-v9.0.0' },
      { tag_name: 'desktop-v3.0.0' },
    ];
    expect(findLatestTvRelease(releases)).toBe('tv-v1.3.0');
  });

  it('returns null when no tv-v* release exists', () => {
    expect(findLatestTvRelease([{ tag_name: 'web-v1.0.0' }])).toBeNull();
    expect(findLatestTvRelease([])).toBeNull();
  });
});

describe('isNewerVersion', () => {
  it('true when the tag is strictly newer than the running version', () => {
    expect(isNewerVersion('tv-v1.3.0', '1.2.0')).toBe(true);
  });

  it('false when equal or older, or unparsable', () => {
    expect(isNewerVersion('tv-v1.2.0', '1.2.0')).toBe(false);
    expect(isNewerVersion('tv-v1.1.0', '1.2.0')).toBe(false);
    expect(isNewerVersion('bogus', '1.2.0')).toBe(false);
    expect(isNewerVersion('tv-v1.2.0', 'bogus')).toBe(false);
  });
});

describe('checkForUpdate', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('reports an update when a newer tv-v* release exists', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ tag_name: 'tv-v1.3.0' }, { tag_name: 'tv-v1.2.0' }]),
    }) as unknown as typeof fetch;

    const result = await checkForUpdate('1.2.0');
    expect(result).toEqual({ updateAvailable: true, latestTag: 'tv-v1.3.0' });
  });

  it('reports no update when already current', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ tag_name: 'tv-v1.2.0' }]),
    }) as unknown as typeof fetch;

    const result = await checkForUpdate('1.2.0');
    expect(result).toEqual({ updateAvailable: false, latestTag: 'tv-v1.2.0' });
  });

  it('never throws on a non-ok response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false }) as unknown as typeof fetch;
    await expect(checkForUpdate('1.2.0')).resolves.toEqual({
      updateAvailable: false,
      latestTag: null,
    });
  });

  it('never throws when fetch rejects (offline)', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;
    await expect(checkForUpdate('1.2.0')).resolves.toEqual({
      updateAvailable: false,
      latestTag: null,
    });
  });
});
