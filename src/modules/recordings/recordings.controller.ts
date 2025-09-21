import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { RecordingsRepository } from './recordings.repository.js'
import { RecordingsService } from './recordings.service.js'
import { UserRepository } from '../user/user.repository.js'
import { appResponse } from '../../lib/response.js'
import { FOUND, NOT_FOUND, SOMETHING_WHEN_WRONG } from '../../lib/constant.js'
import { roleMiddleware } from '../../lib/middleware/middleware.js'
import { logger } from '../../config/logging.js'
import { recordingValidator, generateUploadUrlValidator } from './recordings.validator.js'
import { type UploadedFile } from '../../lib/middleware/file-upload.js'

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
    .post('/upload', async (c) => {
        const repo = new RecordingsRepository()
        const userRepo = new UserRepository()
        try {
            const accessToken = c.req.header('Authorization') || ''
            const user = await userRepo.findByToken({ token: accessToken })
            
            if (!user || !user.id) {
                return appResponse(c, 401, 'User not authenticated', null)
            }

            const userId = user.id
            
            const formData = await c.req.formData()
            const audioFile = formData.get('audio') as File | null
            const note = formData.get('note') as string | null

            if (!audioFile) {
                return appResponse(c, 400, 'No audio file provided', null)
            }

            const buffer = Buffer.from(await audioFile.arrayBuffer())
            const uploadedFile: UploadedFile = {
                buffer,
                originalname: audioFile.name,
                mimetype: audioFile.type,
                size: buffer.length,
            }

            if (!uploadedFile.mimetype.startsWith('audio/')) {
                return appResponse(c, 400, 'Invalid file type. Only audio files are allowed', null)
            }

            const uploadResult = await RecordingsService.uploadRecordingFile(
                uploadedFile.buffer,
                uploadedFile.originalname,
                userId,
                uploadedFile.mimetype
            )

            const recordingData = {
                user: userId,
                file_url: uploadResult.fileUrl!,
                note: note || null,
            }

            const record = await repo.create(recordingData)
            
            return appResponse(c, 201, 'Recording uploaded and saved successfully', {
                recording: record,
                fileUrl: uploadResult.fileUrl,
            })
        } catch (error) {
            logger.error('Upload error:', error)
            return appResponse(c, 500, 'Failed to upload recording', null)
        }
    })
    .post('/upload-url', zValidator('json', generateUploadUrlValidator), async (c) => {
        const userRepo = new UserRepository()
        try {
            const accessToken = c.req.header('Authorization') || ''
            const user = await userRepo.findByToken({ token: accessToken })
            
            if (!user || !user.id) {
                return appResponse(c, 401, 'User not authenticated', null)
            }

            const { filename } = c.req.valid('json')
            const userId = user.id

            const result = await RecordingsService.generateUploadUrl(filename, userId)
            
            return appResponse(c, 200, 'Upload URL generated successfully', {
                uploadUrl: result.uploadUrl,
                filePath: result.filePath,
            })
        } catch (error) {
            logger.error('Generate upload URL error:', error)
            return appResponse(c, 500, 'Failed to generate upload URL', null)
        }
    })
    .post('/confirm-upload', zValidator('json', recordingValidator.omit({ user: true })), async (c) => {
        const repo = new RecordingsRepository()
        const userRepo = new UserRepository()
        try {
            const accessToken = c.req.header('Authorization') || ''
            const user = await userRepo.findByToken({ token: accessToken })
            
            if (!user || !user.id) {
                return appResponse(c, 401, 'User not authenticated', null)
            }

            const userId = user.id
            const { file_url, note } = c.req.valid('json')

            const recordingData = {
                user: userId,
                file_url,
                note: note || null,
            }

            const record = await repo.create(recordingData)
            
            return appResponse(c, 201, 'Recording confirmed and saved successfully', record)
        } catch (error) {
            logger.error('Confirm upload error:', error)
            return appResponse(c, 500, 'Failed to confirm recording upload', null)
        }
    })
