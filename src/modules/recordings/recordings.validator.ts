
import { z } from 'zod'

export const recordingValidator = z.object({
    user: z.coerce.number(),
    file_url: z.string().url(),
    note: z.string().optional(),
    chapter_id: z.coerce.number().optional(),
})

export const uploadFileValidator = z.object({
    note: z.string().optional(),
    chapter_id: z.coerce.number().optional(),
})

export const generateUploadUrlValidator = z.object({
    filename: z.string().min(1, 'Filename is required'),
})
