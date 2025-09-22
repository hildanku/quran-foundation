'use client'

import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { BookOpen } from 'lucide-react'
import { useState } from 'react'

import { client } from '@/lib/rpc'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const registerSchema = z
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

type RegisterFormValues = z.infer<typeof registerSchema>

export const Route = createFileRoute('/_auth/register')({
    component: RegisterPage,
})

function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const navigate = useNavigate()

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: '',
            email: '',
            name: '',
            role: '',
            password: '',
            confirmPassword: '',
        },
        mode: 'all',
    })

    const onSubmit = async (values: RegisterFormValues) => {
        setIsLoading(true)
        try {
            const res = await client.api.v1.auth.register.$post({
                form: {
                    username: values.username,
                    email: values.email,
                    name: values.name,
                    password: values.password,
                },
            })

            if (!res.ok) {
                throw new Error('Failed to register')
            }

            await res.json()

            toast({
                title: 'Welcome to DailyQuran!',
                description: 'Your account has been created successfully.',
            })

            navigate({ to: '/login' })
        } catch (error) {
            toast({
                title: 'Registration failed',
                description: 'Please try again with different credentials.',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary rounded-full">
                            <BookOpen className="h-8 w-8 text-primary-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">Join DailyQuran</CardTitle>
                    <CardDescription>
                        Create your account to start your daily Quran reading habit
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Choose a username" {...field} />
                                        </FormControl>
                                        <FormMessage className="font-normal" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter your full name" {...field} />
                                        </FormControl>
                                        <FormMessage className="font-normal" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="Enter your email" {...field} />
                                        </FormControl>
                                        <FormMessage className="font-normal" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Create a password" {...field} />
                                        </FormControl>
                                        <FormMessage className="font-normal" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Confirm your password" {...field} />
                                        </FormControl>
                                        <FormMessage className="font-normal" />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Creating account...' : 'Create Account'}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
