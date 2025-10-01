import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { v1Routes } from '@/routes.js'
import { logger } from 'hono/logger'
import { appResponse } from '@/lib/response.js'
import { cors } from 'hono/cors'
import { sdk } from '@/config/instrumentation.js'
import { withHttpTrace, addEvent } from '@/lib/telemetry.js'

await sdk.start()
console.log('OpenTelemetry SDK started with ConsoleMetricExporter')

const app = new Hono()
    .use('*', logger())
    .use('*', cors())
    .route('/api/v1', v1Routes)
    .get('/api/v1/healthcheck', async (c) => {
        return withHttpTrace('healthcheck', 'GET', '/healthcheck', async () => {
            addEvent('healthcheck.check', { timestamp: new Date().toISOString() })
            return appResponse(c, 200, 'OK', {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                service: 'quran-hono-api'
            })
        })
    })

serve({
    fetch: app.fetch,
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
})

export type AppType = typeof app
export { app }
