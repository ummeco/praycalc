/**
 * Purpose: Unit tests for the global error reporter — global-handler chaining,
 *   payload shape, the __DEV__ reporting gate, and the fire-and-forget contract
 *   (network failures must never throw or propagate).
 * Constraints: fetch and global.ErrorUtils are mocked per-test; no real network
 *   calls in unit tests. __DEV__ is toggled directly since jest-expo defines it
 *   as a real global (not a module import), matching the RN runtime. The module
 *   under test is re-required (not statically imported) after jest.resetModules()
 *   so each test observes a fresh module-level `_installed`/`_initialised` state
 *   under its own __DEV__/ErrorUtils mocks — dynamic import() is unavailable
 *   under this project's Babel/CJS jest transform.
 */

type ReporterModule = typeof import('../reporter');

function requireReporter(): ReporterModule {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- resetModules()-driven fresh require, not a static dep
  return require('../reporter') as ReporterModule;
}

const originalDev = (globalThis as { __DEV__?: boolean }).__DEV__;

function mockFetchOnce(ok = true) {
  globalThis.fetch = jest.fn().mockResolvedValue({ ok, status: ok ? 200 : 500 }) as unknown as typeof fetch;
}

function mockErrorUtils() {
  const setGlobalHandler = jest.fn();
  const previousHandler = jest.fn();
  const getGlobalHandler = jest.fn(() => previousHandler);
  (globalThis as typeof globalThis & { ErrorUtils?: unknown }).ErrorUtils = {
    setGlobalHandler,
    getGlobalHandler,
  };
  return { setGlobalHandler, getGlobalHandler, previousHandler };
}

describe('reportError', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    (globalThis as { __DEV__?: boolean }).__DEV__ = originalDev;
  });

  it('does not send a report when __DEV__ is true', () => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = true;
    mockFetchOnce();
    mockErrorUtils();
    const { reportError } = requireReporter();

    reportError(new Error('boom'));

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('POSTs a compact JSON payload when __DEV__ is false', () => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;
    mockFetchOnce();
    mockErrorUtils();
    const { reportError, PING_INGEST_URL } = requireReporter();

    reportError(new Error('boom'), 'test-context');

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe(PING_INGEST_URL);
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });

    const body = JSON.parse(init.body);
    expect(body.message).toBe('boom');
    expect(body.context).toBe('test-context');
    expect(typeof body.appVersion).toBe('string');
    expect(typeof body.platform).toBe('string');
    expect(typeof body.timestamp).toBe('string');
  });

  it('truncates the stack trace to at most 20 lines', () => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;
    mockFetchOnce();
    mockErrorUtils();
    const { reportError } = requireReporter();

    const err = new Error('deep stack');
    err.stack = Array.from({ length: 50 }, (_, i) => `line ${i}`).join('\n');

    reportError(err);

    const [, init] = (globalThis.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.stack.split('\n')).toHaveLength(20);
    expect(body.stack.split('\n')[0]).toBe('line 0');
  });

  it('wraps a non-Error thrown value into a message string', () => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;
    mockFetchOnce();
    mockErrorUtils();
    const { reportError } = requireReporter();

    reportError('a plain string error');

    const [, init] = (globalThis.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.message).toBe('a plain string error');
  });

  it('never throws when fetch rejects (fire-and-forget contract)', () => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('network down')) as unknown as typeof fetch;
    mockErrorUtils();
    const { reportError } = requireReporter();

    expect(() => reportError(new Error('boom'))).not.toThrow();
  });

  it('never throws when global.ErrorUtils is absent', () => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;
    mockFetchOnce();
    delete (globalThis as typeof globalThis & { ErrorUtils?: unknown }).ErrorUtils;
    const { reportError } = requireReporter();

    expect(() => reportError(new Error('boom'))).not.toThrow();
  });
});

describe('installGlobalErrorReporter', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    (globalThis as { __DEV__?: boolean }).__DEV__ = originalDev;
  });

  it('registers a global handler and chains to the previously-registered one', () => {
    (globalThis as { __DEV__?: boolean }).__DEV__ = false;
    mockFetchOnce();
    const { setGlobalHandler, previousHandler } = mockErrorUtils();

    requireReporter();

    expect(setGlobalHandler).toHaveBeenCalledTimes(1);
    const installedHandler = setGlobalHandler.mock.calls[0][0];

    const err = new Error('fatal crash');
    installedHandler(err, true);

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [, init] = (globalThis.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.isFatal).toBe(true);
    expect(body.message).toBe('fatal crash');

    // Must always chain to the previous handler regardless of report outcome.
    expect(previousHandler).toHaveBeenCalledWith(err, true);
  });

  it('is a no-op when global.ErrorUtils is absent', () => {
    delete (globalThis as typeof globalThis & { ErrorUtils?: unknown }).ErrorUtils;

    expect(() => requireReporter()).not.toThrow();
  });
});
