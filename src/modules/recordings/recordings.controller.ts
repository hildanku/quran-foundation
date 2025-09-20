import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { RecordingsRepository } from './recordings.repository.js'
import { appResponse } from '../../lib/response.js'
import { FOUND, NOT_FOUND, SOMETHING_WHEN_WRONG } from '../../lib/constant.js'
import { roleMiddleware } from '../../lib/middleware/middleware.js'
import { logger } from '../../config/logging.js'
import { recordingValidator } from './recordings.validator.js'

export const recordingsController = new Hono()
    .use(
        '*',
        roleMiddleware({
            get: ['admin', 'member'],
            update: ['admin'],
            create: ['admin', 'member'],
            delete: ['admin'],
        }),
    )
    .get('/', async (c) => {
        const repo = new RecordingsRepository()
        try {
            const records = await repo.list()
            if (!records || records.length === 0) {
                return appResponse(c, 404, `Recording ${NOT_FOUND}`, null)
            }
            return appResponse(c, 200, `Recording ${FOUND}`, records)
        } catch (error) {
            logger.error(error)
            return appResponse(c, 500, SOMETHING_WHEN_WRONG, null)
        }
    })
    .get('/:id', async (c) => {
        const repo = new RecordingsRepository()
        try {
            const params = c.req.param()
            const id = Number(params.id)
            if (!Number.isFinite(id)) {
                return appResponse(c, 400, 'Invalid recording id', null)
            }

            const record = await repo.read(id)
            if (!record) {
                return appResponse(c, 404, `Recording ${NOT_FOUND}`, null)
            }
            return appResponse(c, 200, `Recording ${FOUND}`, record)
        } catch (error) {
            logger.error(error)
            return appResponse(c, 500, SOMETHING_WHEN_WRONG, null)
        }
    })
    .post('/', zValidator('form', recordingValidator), async (c) => {
        const repo = new RecordingsRepository()
        const form = c.req.valid('form')
        try {
            const record = await repo.create(form)
            return appResponse(c, 201, 'Recording created', record)
        } catch (error) {
            logger.error(error)
            return appResponse(c, 500, SOMETHING_WHEN_WRONG, null)
        }
    })
    .put('/:id', zValidator('form', recordingValidator.partial()), async (c) => {
        const repo = new RecordingsRepository()
        const form = c.req.valid('form')
        try {
            const params = c.req.param()
            const id = Number(params.id)
            if (!Number.isFinite(id)) {
                return appResponse(c, 400, 'Invalid recording id', null)
            }

            const record = await repo.update(id, form)
            return appResponse(c, 200, 'Recording updated', record)
        } catch (error) {
            logger.error(error)
            return appResponse(c, 500, SOMETHING_WHEN_WRONG, null)
        }
    })
    .delete('/:id', async (c) => {
        const repo = new RecordingsRepository()
        try {
            const params = c.req.param()
            const id = Number(params.id)
            if (!Number.isFinite(id)) {
                return appResponse(c, 400, 'Invalid recording id', null)
            }

            const success = await repo.delete(id)
            if (!success) {
                return appResponse(c, 404, `Recording ${NOT_FOUND}`, null)
            }
            return appResponse(c, 200, 'Recording deleted', true)
        } catch (error) {
            logger.error(error)
            return appResponse(c, 500, SOMETHING_WHEN_WRONG, null)
        }
    })
