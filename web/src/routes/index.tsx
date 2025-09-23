import { createFileRoute, redirect } from '@tanstack/react-router'
import { requireAuth } from '@/lib/auth-guard'

export const Route = createFileRoute('/')({
    beforeLoad: async () => {
        await requireAuth()

        throw redirect({
            to: '/dashboard',
        })
    },
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Checking authentication...</div>
}
