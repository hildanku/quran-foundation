import * as winston from 'winston'
import type { Logger } from 'drizzle-orm'

const { combine, timestamp, printf, colorize, align } = winston.format;
// thanks syahrulbudif
export const logger = winston.createLogger({
    level: 'info',
    format: combine(
        colorize({ all: true }),
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        align(),
        printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    transports: [new winston.transports.Console()]
})

export const drizzleLogger: Logger = {
    logQuery(query: string, params: unknown[]) {
        const formattedQuery = query.replace(/\s+/g, ' ').trim()

        const formattedParams = params.map(param => {
            if (typeof param === 'string') {
                return param.replace(/^"(.*)"$/, '$1')
            }
            return param
        })

        const paramCount = (query.match(/\$\d+/g) || []).length

        const groupedParams = []
        for (let i = 0; i < formattedParams.length; i += paramCount) {
            groupedParams.push(formattedParams.slice(i, i + paramCount))
        }

        const logMessage = `
                =======================
                Query: ${formattedQuery}
                Parameters:
                ${groupedParams
                .map((params, index) => `  Row ${index + 1}: ${JSON.stringify(params)}`)
                .join('\n')}
                =======================
        `
        logger.info(logMessage)
    },
}
