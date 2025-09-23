import { redirect } from '@tanstack/react-router'
import { client } from '@/lib/rpc'

export async function requireAuth() {
    const accessToken = localStorage.getItem('access_token')
    
    if (!accessToken) {
        throw redirect({
            to: '/login',
        })
    }

    try {
        // Validate access token by calling current_user endpoint
        const res = await client.api.v1.auth.current_user.$get({
            header: { Authorization: accessToken },
        })

        if (!res.ok) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            throw redirect({
                to: '/login',
            })
        }
    } catch (error) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        throw redirect({
            to: '/login',
        })
    }
}