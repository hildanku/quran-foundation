import { Hono } from 'hono'
import { appResponse } from '../../lib/response.js'
import { SOMETHING_WHEN_WRONG } from '../../lib/constant.js'
import { logger } from '../../config/logging.js'
import { fetchChapters } from './surahs.service.js'

export const surahsController = new Hono()
    .get('/', async (c) => {
        try {
            const chapters = await fetchChapters();
            return appResponse(c, 200, 'Surahs fetched successfully', chapters);
        } catch (error) {
            logger.error('Error fetching surahs:', error)

            if (error instanceof Error) {
                if (error.message === 'UNAUTHORIZED') {
                    return appResponse(c, 401, 'Unauthorized access to Quran Foundation API', null)
                } else if (error.message === 'BAD_GATEWAY') {
                    return appResponse(c, 502, 'Bad Gateway - Quran Foundation API is unavailable', null)
                } else if (error.message.includes('QF_CLIENT_ID') || error.message.includes('QF_CLIENT_SECRET')) {
                    return appResponse(c, 500, 'Server configuration error', null)
                }
            }

            return appResponse(c, 500, SOMETHING_WHEN_WRONG, null)
        }
    })