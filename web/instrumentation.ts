export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // T25.09: OTel SDK — init before Sentry so traces are captured from the first request.
    // Gated on OTEL_EXPORTER_OTLP_ENDPOINT being set — safe to omit in local dev.
    if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
      await import('./lib/otel-init')
    }
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export async function onRequestError(err: unknown, request: unknown, context: unknown) {
  const Sentry = await import('@sentry/nextjs')
  // Cast to Parameters<> to satisfy TypeScript — runtime values are correct Next.js types.
  Sentry.captureRequestError(
    err,
    request as Parameters<typeof Sentry.captureRequestError>[1],
    context as Parameters<typeof Sentry.captureRequestError>[2],
  )
}
