import { z } from 'zod'

export const streakValidator = z.object({
    user: z.coerce.number(),
    current_streak: z.coerce.number().min(0).default(0),
    longest_streak: z.coerce.number().min(0).default(0),
    last_recorded_at: z.coerce.number().optional(), // unix timestamp
})
