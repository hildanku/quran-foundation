import z from 'zod'

export const loginSchema = z.object({
    username: z
        .string({ message: 'Username is not valid' })
        .min(3, { message: 'Please input username correctly!' })
    ,
    password: z
        .string({ message: 'Password is not valid' })
        .min(6, { message: 'Password must be at least 6 characters' })
        .max(255, { message: 'Password is too long' }),
})

export const registerSchema = z
    .object({
        username: z.string().min(3, 'Username must be at least 3 characters'),
        email: z.string().email('Please enter a valid email address'),
        name: z.string().min(3, 'Name must be at least 3 characters'),
        role: z.string().optional(),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords don\'t match',
        path: ['confirmPassword'],
    })
