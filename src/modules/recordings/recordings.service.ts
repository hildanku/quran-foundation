
import { logger } from '../../config/logging.js'
import { StorageService } from '../../lib/storage.js'

export class RecordingsService {
    static async uploadRecordingFile(
        fileBuffer: Buffer,
        filename: string,
        userId: number,
        contentType?: string
    ) {
        try {
            logger.info(`Starting file upload for user ${userId}: ${filename}`)

            const result = await StorageService.uploadFile(
                fileBuffer,
                filename,
                userId,
                contentType
            )
            
            if (!result.success) {
                logger.error(`File upload failed for user ${userId}: ${result.error}`)
                throw new Error(result.error || 'File upload failed')
            }

            logger.info(`File upload successful for user ${userId}: ${result.url}`)
            return {
                success: true,
                fileUrl: result.url,
            }
        } catch (error) {
            logger.error('RecordingsService upload error:', error)
            throw error
        }
    }

    static async deleteRecordingFile(fileUrl: string): Promise<boolean> {
        try {
            logger.info(`Deleting file: ${fileUrl}`)
            const result = await StorageService.deleteFile(fileUrl)
            
            if (result) {
                logger.info(`File deleted successfully: ${fileUrl}`)
            } else {
                logger.error(`File deletion failed: ${fileUrl}`)
            }
            
            return result
        } catch (error) {
            logger.error('RecordingsService delete error:', error)
            return false
        }
    }

    static async generateUploadUrl(filename: string, userId: number) {
        try {
            logger.info(`Generating upload URL for user ${userId}: ${filename}`)
            
            const result = await StorageService.generatePresignedUploadUrl(filename, userId)
            
            if (result.error) {
                logger.error(`Failed to generate upload URL: ${result.error}`)
                throw new Error(result.error)
            }

            return {
                uploadUrl: result.uploadUrl,
                filePath: result.filePath,
            }
        } catch (error) {
            logger.error('RecordingsService generateUploadUrl error:', error)
            throw error
        }
    }
}
