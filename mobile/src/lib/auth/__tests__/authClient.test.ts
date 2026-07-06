/**
 * Purpose: Unit tests for the hasura-auth REST client (signup/signin/refresh).
 * Constraints: Verifies /v1/auth/* endpoint forms (regression guard for the
 *   previous bespoke '/token' route bug) and correct request bodies.
 */

import { signup, signin, refreshToken } from '../authClient';

function mockFetchOnce(status: number, body: unknown) {
  return jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response);
}

describe('authClient', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('signup', () => {
    it('POSTs to /signup/email-password with email, password, options.displayName', async () => {
      const fetchSpy = mockFetchOnce(200, {
        session: { accessToken: 'a', refreshToken: 'r', user: { id: 'u1', email: 'x@y.com' } },
      });

      await signup('x@y.com', 'hunter2', 'Ali');

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://auth.ummat.dev/signup/email-password');
      expect(JSON.parse(init.body as string)).toEqual({
        email: 'x@y.com',
        password: 'hunter2',
        options: { displayName: 'Ali' },
      });
    });

    it('returns null session when email verification is required', async () => {
      mockFetchOnce(200, { session: null });
      const result = await signup('x@y.com', 'hunter2');
      expect(result).toBeNull();
    });

    it('throws with server message on non-ok response', async () => {
      mockFetchOnce(400, { message: 'Email already in use' });
      await expect(signup('x@y.com', 'hunter2')).rejects.toThrow('Email already in use');
    });
  });

  describe('signin', () => {
    it('POSTs to /signin/email-password', async () => {
      const fetchSpy = mockFetchOnce(200, {
        session: { accessToken: 'a', refreshToken: 'r', user: { id: 'u1', email: 'x@y.com' } },
      });

      const session = await signin('x@y.com', 'hunter2');

      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://auth.ummat.dev/signin/email-password');
      expect(JSON.parse(init.body as string)).toEqual({ email: 'x@y.com', password: 'hunter2' });
      expect(session.user.id).toBe('u1');
    });

    it('throws "Invalid credentials"-style message on 401', async () => {
      mockFetchOnce(401, { message: 'Invalid email or password' });
      await expect(signin('x@y.com', 'wrong')).rejects.toThrow('Invalid email or password');
    });
  });

  describe('refreshToken', () => {
    it('POSTs to /token with refreshToken body', async () => {
      const fetchSpy = mockFetchOnce(200, {
        accessToken: 'new-a',
        refreshToken: 'new-r',
        accessTokenExpiresIn: 900,
      });

      const result = await refreshToken('old-r');

      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://auth.ummat.dev/token');
      expect(JSON.parse(init.body as string)).toEqual({ refreshToken: 'old-r' });
      expect(result.accessToken).toBe('new-a');
    });
  });
});
