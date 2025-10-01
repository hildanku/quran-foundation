import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { loginSchema, refreshJWTSchema, registerSchema } from './authentication.validator.js'
import { UserRepository } from '../user/user.repository.js'
import { AuthenticationRepository } from './authentication.repository.js'
import { appResponse } from '../../lib/response.js'
import { hash, verify } from '@node-rs/argon2'
import { env } from 'hono/adapter'
import type { ENV } from '../../lib/types.js'
import { JWTService } from '../../lib/middleware/jwt.js'
import { jwtMiddleware } from '../../lib/middleware/middleware.js'
import { logger } from '../../config/logging.js'
import { SOMETHING_WHEN_WRONG } from '../../lib/constant.js'
import { withHttpTrace, withDbTrace, addEvent } from '../../lib/telemetry.js'


export const authController = new Hono()
    .post('/register', zValidator('form', registerSchema), async (c) => {
        return withHttpTrace('auth.register', 'POST', '/auth/register', async () => {
            const form = c.req.valid('form')
            const userRepo = new UserRepository()
            const authRepo = new AuthenticationRepository()

            try {
                addEvent('auth.register.start', { username: form.username })

                const existingUser = await withDbTrace('read', 'users', async () =>
                    userRepo.findByUsername({ username: form.username })
                )

                if (existingUser.length > 0 || !existingUser) {
                    logger.info('Username already taken')
                    addEvent('auth.register.failed', { reason: 'username_taken' })
                    return appResponse(c, 400, 'username already taken', null)
                }

                const user = await withDbTrace('create', 'users', async () =>
                    userRepo.create({
                        role: form.role || 'member',
                        username: form.username,
                        email: form.email,
                        name: form.name,
                        avatar: null,
                    })
                )

                const hashed = await hash(form.password)
                await withDbTrace('create', 'authentications', async () =>
                    authRepo.create({
                        user: user.id,
                        refresh_token: null,
                        hash_password: hashed,
                    })
                )

                addEvent('auth.register.success', { userId: user.id })
                logger.info(user)
                return appResponse(c, 201, 'register success', user)
            } catch (error) {
                addEvent('auth.register.error', { error: error instanceof Error ? error.message : 'unknown' })
                logger.error(error)
                return appResponse(c, 500, SOMETHING_WHEN_WRONG, null)
            }
        })
    })
    .post('/login', zValidator('form', loginSchema), async (c) => {
        return withHttpTrace('auth.login', 'POST', '/auth/login', async () => {
            const valid = c.req.valid('form')
            const userRepo = new UserRepository()
            const authRepo = new AuthenticationRepository()

            try {
                addEvent('auth.login.start', { username: valid.username })

                const [user] = await withDbTrace('read', 'users', async () =>
                    userRepo.findByUsername({ username: valid.username })
                )

                if (!user) {
                    logger.error(`Someone has failed to log in with the username: ${valid.username}`)
                    addEvent('auth.login.failed', { reason: 'user_not_found', username: valid.username })
                    return appResponse(c, 400, 'username/password is wrong', null)
                }

                const [auth] = await withDbTrace('read', 'authentications', async () =>
                    authRepo.findByUser({ user: user.id })
                )

                const validPassword = await verify(auth.hash_password, valid.password)
                if (!validPassword) {
                    logger.error(`Someone has failed to log in with the username: ${valid.username}`)
                    addEvent('auth.login.failed', { reason: 'invalid_password', username: valid.username })
                    return appResponse(c, 400, 'username/password is wrong', null)
                }

                const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = env<ENV>(c)
                const jwt = new JWTService(JWT_ACCESS_SECRET, JWT_REFRESH_SECRET)

                const accessToken = await jwt.createAccess(user.id)
                const refreshToken = await jwt.createRefresh(user.id)

                await withDbTrace('update', 'authentications', async () =>
                    authRepo.update(auth.id, { refresh_token: refreshToken })
                )

                addEvent('auth.login.success', { userId: user.id, username: valid.username })
                logger.info(`Someone has successfully logged in with the username ${valid.username}`)
                return appResponse(c, 200, 'login success', {
                    access_token: accessToken,
                    refresh_token: refreshToken,
                })
            } catch (error) {
                addEvent('auth.login.error', { error: error instanceof Error ? error.message : 'unknown' })
                logger.error(error)
                return appResponse(c, 500, SOMETHING_WHEN_WRONG, null)
            }
        })
    })
    .post('/refresh', zValidator('form', refreshJWTSchema), async (c) => {
        const valid = c.req.valid('form')
        const authRepo = new AuthenticationRepository()
        try {
            const decoded = JWTService.decode(valid.refresh_token)
            if (!decoded || !decoded.sub) {
                return appResponse(c, 401, 'invalid refresh token', null)
            }

            const [auth] = await authRepo.findByUser({ user: Number(decoded.sub) })

            if (!auth || auth.refresh_token !== valid.refresh_token) {
                return appResponse(c, 400, 'invalid refresh token', null)
            }

            const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = env<ENV>(c)
            const jwt = new JWTService(JWT_ACCESS_SECRET, JWT_REFRESH_SECRET)

            const newAccess = await jwt.createAccess(Number(decoded.sub))
            const newRefresh = await jwt.createRefresh(Number(decoded.sub))

            await authRepo.update(auth.id, { refresh_token: newRefresh })
            return appResponse(c, 200, 'refresh success', {
                access_token: newAccess,
                refresh_token: newRefresh,
            })
        } catch (error) {
            logger.error(error)
            return appResponse(c, 500, SOMETHING_WHEN_WRONG, null)
        }
    })
    .get('/current_user', jwtMiddleware, async (c) => {
        const token = c.req.header('Authorization')!
        const userRepo = new UserRepository()
        try {
            const user = await userRepo.findByToken({ token })

            if (!user) return appResponse(c, 404, 'user not found', null)
            return appResponse(c, 200, 'success', user)
        } catch (error) {
            logger.error(error)
            return appResponse(c, 500, SOMETHING_WHEN_WRONG, null)
        }
    })
    .delete('/logout', jwtMiddleware, async (c) => {
        const token = c.req.header('Authorization')!
        const authRepo = new AuthenticationRepository()

        try {
            const claims = JWTService.decode(token)

            if (!claims?.sub) return appResponse(c, 401, 'unauthorized', null)

            const [auth] = await authRepo.findByUser({ user: Number(claims.sub) })
            await authRepo.update(auth.id, { refresh_token: null })

            return appResponse(c, 200, 'logout success', null)
        } catch (error) {
            logger.error(error)
            return appResponse(c, 500, SOMETHING_WHEN_WRONG, null)
        }

    })
