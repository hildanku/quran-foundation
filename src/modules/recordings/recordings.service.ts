
import { logger } from '../../config/logging.js'
import { StorageService } from '../../lib/storage.js'
import { withTrace, addEvent } from '../../lib/telemetry.js'

export class RecordingsService {
    static async uploadRecordingFile(
        fileBuffer: Buffer,
        filename: string,
        userId: number,
        contentType?: string
    ) {
        return withTrace('recordings.service.upload_file', async () => {
            try {
                addEvent('recording.service.upload_start', {
                    filename,
                    userId,
                    contentType: contentType || 'unknown',
                    fileSize: fileBuffer.length
                })

                logger.info(`Starting file upload for user ${userId}: ${filename}`)

                const result = await StorageService.uploadFile(
                    fileBuffer,
                    filename,
                    userId,
                    contentType
                )

                if (!result.success) {
                    addEvent('recording.service.upload_failed', {
                        userId,
                        filename,
                        error: result.error || 'unknown_error'
                    })
                    logger.error(`File upload failed for user ${userId}: ${result.error}`)
                    throw new Error(result.error || 'File upload failed')
                }

                addEvent('recording.service.upload_success', {
                    userId,
                    filename,
                    fileUrl: result.url || 'unknown_url'
                })
                logger.info(`File upload successful for user ${userId}: ${result.url}`)
                return {
                    success: true,
                    fileUrl: result.url,
                }
            } catch (error) {
                addEvent('recording.service.upload_error', {
                    error: error instanceof Error ? error.message : 'unknown'
                })
                logger.error('RecordingsService upload error:', error)
                throw error
            }
        })
    }

    static async deleteRecordingFile(fileUrl: string): Promise<boolean> {
        return withTrace('recordings.service.delete_file', async () => {
            try {
                addEvent('recording.service.delete_start', { fileUrl })
                logger.info(`Deleting file: ${fileUrl}`)

                const result = await StorageService.deleteFile(fileUrl)

                if (result) {
                    addEvent('recording.service.delete_success', { fileUrl })
                    logger.info(`File deleted successfully: ${fileUrl}`)
                } else {
                    addEvent('recording.service.delete_failed', { fileUrl })
                    logger.error(`File deletion failed: ${fileUrl}`)
                }

                return result
            } catch (error) {
                addEvent('recording.service.delete_error', {
                    fileUrl,
                    error: error instanceof Error ? error.message : 'unknown'
                })
                logger.error('RecordingsService delete error:', error)
                return false
            }
        })
    }

    static async generateUploadUrl(filename: string, userId: number) {
        return withTrace('recordings.service.generate_upload_url', async () => {
            try {
                addEvent('recording.service.generate_url_start', { filename, userId })
                logger.info(`Generating upload URL for user ${userId}: ${filename}`)

                const result = await StorageService.generatePresignedUploadUrl(filename, userId)

                if (result.error) {
                    addEvent('recording.service.generate_url_failed', {
                        userId,
                        filename,
                        error: result.error
                    })
                    logger.error(`Failed to generate upload URL: ${result.error}`)
                    throw new Error(result.error)
                }

                addEvent('recording.service.generate_url_success', {
                    userId,
                    filename,
                    uploadUrl: result.uploadUrl || 'unknown_url'
                })

                return {
                    uploadUrl: result.uploadUrl,
                    filePath: result.filePath,
                }
            } catch (error) {
                addEvent('recording.service.generate_url_error', {
                    error: error instanceof Error ? error.message : 'unknown'
                })
                logger.error('RecordingsService generateUploadUrl error:', error)
                throw error
            }
        })
    }
}
