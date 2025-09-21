import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from '@/lib/stores/auth'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { BookOpen, Mic, Settings, User } from 'lucide-react'
import { client } from '@/lib/rpc'
import { appFetch } from '@/lib/app-fetch'
import { StreakCounter } from '@/components/custom/streak-counter'
import Loading from '@/components/ui/loading'

export const Route = createFileRoute('/dashboard')({
    component: RouteComponent,
})

function RouteComponent() {
    return <DashboardPage />
}


type Recording = {
    id: number
    user: number | null
    created_at: number
    updated_at: number
    file_url: string
    note: string | null
}

function DashboardPage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const {
        data: recordingsResponse,
        isLoading: recordingsLoading,
        isError: _recordingsError,
    } = useQuery({
        queryKey: ['recordings'],
        queryFn: async () => {
            const response = await client.api.v1.recordings.$get(
                {},
                {
                    fetch: appFetch,
                }
            )
            return response.json()
        }
    })

    const recordings: Recording[] = recordingsResponse?.result ?? []

    const {
        data: streakData,
        isLoading: streaksLoading,
        isError: streaksError,
    } = useQuery({
        queryKey: ['streaks'],
        queryFn: async () => {
            const response = await client.api.v1.streaks.$get(
                {},
                {
                    fetch: appFetch,
                }
            )
            console.log(response)
            return response.json()
        }
    })

    const streakD = streakData?.result ?? []
    console.log(streakD)
    const today = new Date().toISOString().split("T")[0]
    const todayCompleted = recordings.some((recording) => {
        const date = new Date(recording.created_at).toISOString().split("T")[0]
        return date === today
    })

    const completedDates = recordings.map((recording) =>
        new Date(recording.created_at).toISOString().split("T")[0],
    )

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }


    if (recordingsLoading || streaksLoading) {
        <Loading />
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
                <header className="bg-white/80 backdrop-blur-sm border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary rounded-lg">
                                    <BookOpen className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold">DailyQuran</h1>
                                    <p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/settings" })}>
                                    <Settings className="h-4 w-4" />
                                </Button>
                                <Avatar>
                                    <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                                    <AvatarFallback>{user?.name ? getInitials(user.name) : <User className="h-4 w-4" />}</AvatarFallback>
                                </Avatar>
                                {/* <Button variant="ghost" size="sm" onClick={handleLogout}>
                                <LogOut className="h-4 w-4" />
                            </Button> */}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="md:col-span-2 lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Today's Reading</CardTitle>
                                <CardDescription>
                                    {todayCompleted ? "Great job! You've completed today's reading." : "Ready to continue your streak?"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {todayCompleted ? (
                                        <div className="text-center py-4">
                                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <BookOpen className="h-8 w-8 text-green-600" />
                                            </div>
                                            <p className="text-sm text-muted-foreground">You've already recorded today. Come back tomorrow!</p>
                                        </div>
                                    ) : (
                                        <Link to="/record">
                                            <Button size="lg" className="w-full flex items-center gap-2">
                                                <Mic className="h-5 w-5" />
                                                Start Recording
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {streaksError ? (
                            <Card className="md:col-span-2 lg:col-span-1 flex items-center justify-center min-h-[120px]">
                                <CardContent>Error loading streak</CardContent>
                            </Card>
                        ) : streakD && streakD.length > 0 ? (
                            <StreakCounter
                                currentStreak={streakD[0].current_streak}
                                longestStreak={streakD[0].longest_streak}
                                todayCompleted={todayCompleted}
                                className="md:col-span-2 lg:col-span-1"
                            />
                        ) : (
                            <Card className="md:col-span-2 lg:col-span-1 flex items-center justify-center min-h-[120px]">
                                <CardContent>No streak data</CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Quick Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Total Recordings</span>
                                        <span className="font-medium">{recordings.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">This Month</span>
                                        <span className="font-medium">
                                            {recordings.filter((r) => new Date(r.created_at).getMonth() === new Date().getMonth()).length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Success Rate</span>
                                        <span className="font-medium">
                                            {recordings.length > 0 ? Math.round((completedDates.length / new Date().getDate()) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </>
    )
}
