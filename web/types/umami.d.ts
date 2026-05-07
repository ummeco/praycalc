// Window.umami — Umami analytics (D-P3-21). Optional because consent-gated.

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, unknown>) => void
      identify?: (userId: string) => void
    }
  }
}

export {}

