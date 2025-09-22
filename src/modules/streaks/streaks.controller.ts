import { Hono } from "hono"
import { roleMiddleware } from "../../lib/middleware/middleware.js";
import { StreaksRepository } from "./streaks.repository.js";
import { appResponse } from "../../lib/response.js";
import { FOUND, NOT_FOUND, SOMETHING_WHEN_WRONG } from "../../lib/constant.js";
import { logger } from "../../config/logging.js";
import { zValidator } from "@hono/zod-validator";
import { streakValidator } from "./streaks.validator.js";
import { UserRepository } from "../user/user.repository.js";

export const streaksController = new Hono()
    .use(
        '*',
        roleMiddleware({
            get: ['admin', 'member'],
            update: ['admin', 'member'],
            create: ['admin', 'member'],
            delete: ['member', 'admin']
        })
    )
    .get('/user', async (c) => {
        const repo = new StreaksRepository()
        const userRepo = new UserRepository()
        const token = c.req.header('Authorization')!
        try {
            const user = await userRepo.findByToken({ token: token })
            if (!user) {
                return appResponse(c, 404, NOT_FOUND, null)
            }
            console.log(user.id)
            const streak = await repo.findByUser(user.id)
            if (!streak) {
                return appResponse(c, 404, `Streak ${NOT_FOUND}`, null)
            }
            return appResponse(c, 200, `Streak ${FOUND}`, streak)
        } catch (error) {
            logger.error(error)
            return appResponse(c, 500, SOMETHING_WHEN_WRONG, null)
        }
    })
    .get('/', async (c) => {
        const repo = new StreaksRepository()
        try {
            const streaks = await repo.list()
            if (!streaks || streaks.length === 0) {
                return appResponse(c, 404, `Streak ${NOT_FOUND}`, null)
            }
            return appResponse(c, 200, `Streak ${FOUND}`, streaks)
        } catch (error) {
            logger.error(error)
            return appResponse(c, 500, SOMETHING_WHEN_WRONG, null)
        }
    })
    .get('/:id', async (c) => {
        const repo = new StreaksRepository()
        try {
            const id = Number(c.req.param('id'))
            if (!Number.isFinite(id)) {
                return appResponse(c, 400, 'Invalid streak id', null)
            }
            const streak = await repo.read(id)
            if (!streak) {
                return appResponse(c, 404, `Streak ${NOT_FOUND}`, null)
            }
            return appResponse(c, 200, `Streak ${FOUND}`, streak)
        } catch (error) {
            logger.error(error)
            return appResponse(c, 500, SOMETHING_WHEN_WRONG, null)
        }
    })
    .post('/', zValidator('form', streakValidator), async (c) => {
        const repo = new StreaksRepository()
        const form = c.req.valid('form')
        try {
            const streak = await repo.create(form)
            return appResponse(c, 201, 'Streak created', streak)
        } catch (error) {
            logger.error(error)
            return appResponse(c, 500, SOMETHING_WHEN_WRONG, null)
        }
    })
    .put('/:id', zValidator('form', streakValidator.partial()), async (c) => {
        const repo = new StreaksRepository()
        const form = c.req.valid('form')
        try {
            const id = Number(c.req.param('id'))
            if (!Number.isFinite(id)) {
                return appResponse(c, 400, 'Invalid streak id', null)
            }
            const streak = await repo.update(id, form)
            return appResponse(c, 200, 'Streak updated', streak)
        } catch (error) {
            logger.error(error)
            return appResponse(c, 500, SOMETHING_WHEN_WRONG, null)
        }
    })
    .delete('/:id', async (c) => {
        const repo = new StreaksRepository()
        try {
            const id = Number(c.req.param('id'))
            if (!Number.isFinite(id)) {
                return appResponse(c, 400, 'Invalid streak id', null)
            }
            const success = await repo.delete(id)
            if (!success) {
                return appResponse(c, 404, `Streak ${NOT_FOUND}`, null)
            }
            return appResponse(c, 200, 'Streak deleted', true)
        } catch (error) {
            logger.error(error)
            return appResponse(c, 500, SOMETHING_WHEN_WRONG, null)
        }
    })

