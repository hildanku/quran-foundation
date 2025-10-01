import { trace, SpanStatusCode, SpanKind } from '@opentelemetry/api'
import { logger } from '../config/logging.js'

// Get the tracer instance
const tracer = trace.getTracer('quran-hono-api', '1.0.0')

export async function withTrace<T>(
    spanName: string,
    fn: () => Promise<T> | T,
    attributes?: Record<string, string | number | boolean>
): Promise<T> {
    return tracer.startActiveSpan(spanName, { kind: SpanKind.INTERNAL }, async (span) => {
        try {
            // Add attributes if provided
            if (attributes) {
                span.setAttributes(attributes)
            }

            const result = await fn()
            span.setStatus({ code: SpanStatusCode.OK })
            return result
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'

            span.recordException(error as Error)
            span.setStatus({
                code: SpanStatusCode.ERROR,
                message: errorMessage
            })

            logger.error(`Trace error in ${spanName}:`, error)
            throw error
        } finally {
            span.end()
        }
    })
}

export async function withHttpTrace<T>(
    operationName: string,
    method: string,
    endpoint: string,
    fn: () => Promise<T> | T
): Promise<T> {
    return withTrace(
        operationName,
        fn,
        {
            'http.method': method,
            'http.route': endpoint,
            'service.name': 'quran-api',
        }
    )
}

export async function withDbTrace<T>(
    operation: 'create' | 'read' | 'update' | 'delete' | 'list',
    table: string,
    fn: () => Promise<T> | T,
    recordId?: string | number
): Promise<T> {
    const attributes: Record<string, string | number> = {
        'db.operation': operation,
        'db.table': table,
        'db.system': 'postgresql',
    }

    if (recordId) {
        attributes['db.record.id'] = recordId.toString()
    }

    return withTrace(
        `db.${operation}.${table}`,
        fn,
        attributes
    )
}

export async function withFileTrace<T>(
    operation: 'upload' | 'download' | 'delete',
    filename: string,
    fn: () => Promise<T> | T
): Promise<T> {
    return withTrace(
        `file.${operation}`,
        fn,
        {
            'file.operation': operation,
            'file.name': filename,
        }
    )
}

export function addEvent(name: string, attributes?: Record<string, string | number | boolean>) {
    const activeSpan = trace.getActiveSpan()
    if (activeSpan) {
        activeSpan.addEvent(name, attributes)
    }
}

export function setSpanAttributes(attributes: Record<string, string | number | boolean>) {
    const activeSpan = trace.getActiveSpan()
    if (activeSpan) {
        activeSpan.setAttributes(attributes)
    }
}

export { tracer }
