import { supabase, STORAGE_BUCKET } from '../config/supabase.js'
import { logger } from '../config/logging.js'

export interface UploadResult {
    success: boolean
    url?: string
    error?: string
}

export class StorageService {
    static async uploadFile(
        buffer: Buffer,
        filename: string,
        userId: number,
        contentType: string = 'audio/*'
    ): Promise<UploadResult> {
        try {
            const timestamp = Date.now()
            const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
            const uniqueFilename = `user_${userId}/${timestamp}_${sanitizedFilename}`

            logger.info(`Uploading file to Supabase Storage: ${uniqueFilename}`)

            const { data, error } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(uniqueFilename, buffer, {
                    contentType,
                    cacheControl: '3600',
                    upsert: false,
                })

            if (error) {
                logger.error('Supabase Storage upload error:', error)
                return {
                    success: false,
                    error: `Upload failed: ${error.message}`,
                }
            }

            const { data: urlData } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(data.path)

            logger.info(`File uploaded successfully: ${urlData.publicUrl}`)

            return {
                success: true,
                url: urlData.publicUrl,
            }
        } catch (error) {
            logger.error('Unexpected error during file upload:', error)
            return {
                success: false,
                error: 'Unexpected error during file upload',
            }
        }
    }

    static async deleteFile(fileUrl: string): Promise<boolean> {
        try {
            const url = new URL(fileUrl)
            const pathSegments = url.pathname.split('/')
            const bucketIndex = pathSegments.findIndex(segment => segment === STORAGE_BUCKET)
            
            if (bucketIndex === -1) {
                logger.error('Invalid file URL format')
                return false
            }

            const filePath = pathSegments.slice(bucketIndex + 1).join('/')

            logger.info(`Deleting file from Supabase Storage: ${filePath}`)

            const { error } = await supabase.storage
                .from(STORAGE_BUCKET)
                .remove([filePath])

            if (error) {
                logger.error('Supabase Storage delete error:', error)
                return false
            }

            logger.info(`File deleted successfully: ${filePath}`)
            return true
        } catch (error) {
            logger.error('Unexpected error during file deletion:', error)
            return false
        }
    }

    static async generatePresignedUploadUrl(
        filename: string,
        userId: number
    ): Promise<{ uploadUrl?: string; filePath?: string; error?: string }> {
        try {
            const timestamp = Date.now()
            const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
            const uniqueFilename = `user_${userId}/${timestamp}_${sanitizedFilename}`

            const { data, error } = await supabase.storage
                .from(STORAGE_BUCKET)
                .createSignedUploadUrl(uniqueFilename)

            if (error) {
                logger.error('Failed to generate presigned URL:', error)
                return { error: `Failed to generate upload URL: ${error.message}` }
            }

            return {
                uploadUrl: data.signedUrl,
                filePath: uniqueFilename,
            }
        } catch (error) {
            logger.error('Unexpected error generating presigned URL:', error)
            return { error: 'Unexpected error generating upload URL' }
        }
    }
}