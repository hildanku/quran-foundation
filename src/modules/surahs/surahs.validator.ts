import { z } from 'zod'

export const surahsValidator = z.object({
    id: z.number().optional(),
    name: z.string().optional(),
})

export type SurahsValidatorType = z.infer<typeof surahsValidator>