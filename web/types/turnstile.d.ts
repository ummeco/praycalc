// Window.turnstile — Cloudflare Turnstile CAPTCHA (D-P3-20 / T09 SEC-HARDENING).

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback?: (token: string) => void
          'expired-callback'?: () => void
          appearance?: 'always' | 'execute' | 'interaction-only'
          theme?: 'light' | 'dark' | 'auto'
          size?: 'normal' | 'compact'
        },
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
  }
}

export {}
