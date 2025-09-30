import { ConsoleMetricExporter, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'

const jaegerExporter = new OTLPTraceExporter({
    url: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces'
})

const spanExporter = process.env.NODE_ENV === 'development' ?
    jaegerExporter :
    new ConsoleSpanExporter()

export const sdk = new NodeSDK({
    traceExporter: spanExporter,
    metricReader: new PeriodicExportingMetricReader({
        exporter: new ConsoleMetricExporter(),
        exportIntervalMillis: 30000,
    }),
    instrumentations: [
        getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-fs': {
                enabled: false,
            },
            '@opentelemetry/instrumentation-dns': {
                enabled: false,
            },
            '@opentelemetry/instrumentation-net': {
                enabled: false,
            },
            '@opentelemetry/instrumentation-http': {
                enabled: true,
                ignoreIncomingRequestHook: (req) => {
                    // Ignore health check and static file requests
                    const url = req.url || ''
                    return url.includes('/healthcheck') ||
                        url.includes('/favicon.ico') ||
                        url.includes('/static/')
                },
            },
        }),
    ],
})
