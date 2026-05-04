/**
 * OpenTelemetry SDK initialization for server-side Next.js (nodejs runtime only).
 *
 * T25.09 — wires OTLP trace export to Tempo via OTEL_EXPORTER_OTLP_ENDPOINT.
 * Called from instrumentation.ts only when OTEL_EXPORTER_OTLP_ENDPOINT is set.
 *
 * Required packages (pnpm add):
 *   @opentelemetry/sdk-node
 *   @opentelemetry/auto-instrumentations-node
 *   @opentelemetry/exporter-trace-otlp-http
 */
import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'

const sdk = new NodeSDK({
  // Service name: OTEL_SERVICE_NAME env var (e.g. "praycalc-web").
  // Falls back to "unknown-service" if not set — always set OTEL_SERVICE_NAME in Vercel.
  serviceName: process.env.OTEL_SERVICE_NAME ?? 'unknown-service',
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    headers: {},
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable noisy instrumentations not relevant to Next.js API routes.
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-dns': { enabled: false },
    }),
  ],
})

sdk.start()

// Graceful shutdown on process exit (prevents trace data loss on Vercel cold-start teardown).
process.on('SIGTERM', () => {
  sdk.shutdown().catch((err) => console.error('OTel SDK shutdown error:', err))
})
