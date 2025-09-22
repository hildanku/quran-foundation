import { z } from "zod";

export const paginationQueryValidator = z.object({
    page: z.string().optional().transform((val) => val ? Math.max(1, parseInt(val)) || 1 : 1),
    limit: z.string().optional().transform((val) => val ? Math.max(1, Math.min(100, parseInt(val))) || 10 : 10),
})
