import z from 'zod'

export const loginSchema = z.object({
    username: z
        .string({ message: 'Username is not valid' })
        .min(2, { message: 'Please input username correctly!' })
    ,
    password: z
        .string({ message: 'Password is not valid' })
        .min(8, { message: 'Password minimal is 8 character' })
        .max(255, { message: 'Password is too long' }),
})

export const registerSchema = z
    .object({
        username: z.string().min(3, 'Username must be at least 3 characters'),
        email: z.string().email('Please enter a valid email address'),
        name: z.string().min(2, 'Name must be at least 2 characters'),
        role: z.string().optional(),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords don\'t match',
        path: ['confirmPassword'],
    })
