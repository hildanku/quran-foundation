
import { z } from 'zod'

export const recordingValidator = z.object({
    user: z.coerce.number(),
    file_url: z.string().url(),
    note: z.string().optional(),
})
