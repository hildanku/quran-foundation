import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from '@/lib/stores/auth'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { BookOpen, Mic, Settings, User, LogOut } from 'lucide-react'
import { client } from '@/lib/rpc'
import { appFetch } from '@/lib/app-fetch'
import { StreakCounter } from '@/components/custom/streak-counter'
import Loading from '@/components/ui/loading'
import { RecordingHistory } from '@/components/custom/recording-history'
import { ProgressCalendar } from '@/components/custom/progress-calendar'
import { SurahList } from '@/components/custom/surah-list'

export const Route = createFileRoute('/dashboard')({
    component: RouteComponent,
})

function RouteComponent() {
    return <DashboardPage />
}

function DashboardPage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const {
        data: recordingsResult,
        isLoading: isRecordingsLoading,
        isError: isRecordingsError,
    } = useQuery({
        queryKey: ['recordings'],
        queryFn: async () => {
            const response = await client.api.v1.recordings.user.$get(
                {},
                {
                    fetch: appFetch,
                }
            )
            return response.json()
        },
        retry: (failureCount, error: any) => {
            // Don't retry on 404 or client errors (4xx)
            if (error?.status >= 400 && error?.status < 500) {
                return false
            }
            return failureCount < 3
        }
    })

    // Fallback to empty array if error or no data
    const recordings = recordingsResult?.result?.data || []

    const {
        data: streaksResult,
        isLoading: isStreaksLoading,
        isError: isStreaksError,
    } = useQuery({
        queryKey: ['streaks'],
        queryFn: async () => {
            const response = await client.api.v1.streaks.user.$get(
                {},
                {
                    fetch: appFetch,
                }
            )
            return response.json()
        },
        retry: (failureCount, error: any) => {
            // Don't retry on 404 or client errors (4xx)
            if (error?.status >= 400 && error?.status < 500) {
                return false
            }
            return failureCount < 3
        }
    })

    // Fallback to default streak data if error or no data
    const streaks = streaksResult?.result ?? {
        current_streak: 0,
        longest_streak: 0
    }

    const today = new Date().toISOString().split("T")[0]

    const todayCompleted = recordings.some((recording) => {
        const date = new Date(recording.created_at * 1000).toISOString().split("T")[0]
        return date === today
    })


    const completedDates = recordings.map((recording) =>
        new Date(recording.created_at * 1000).toISOString().split("T")[0],
    )
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }

    const handleSurahClick = (surah: any) => {
        navigate({
            to: '/record',
            search: { surahId: surah.id, surahName: surah.name_simple }
        })
    }
    const handleLogout = () => {
        logout()
        navigate({ to: '/login' })
    }

    // Only show loading when both are still loading initially
    if (isRecordingsLoading && isStreaksLoading) {
        return <Loading />
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
                                <Button variant="ghost" size="sm" onClick={handleLogout}>
                                    <LogOut className="h-4 w-4" />
                                </Button>
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
                                        <Link
                                            to="/record"
                                        >
                                            <Button size="lg" className="w-full flex items-center gap-2">
                                                <Mic className="h-5 w-5" />
                                                Start Recording
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <StreakCounter
                            currentStreak={streaks.current_streak}
                            longestStreak={streaks.longest_streak}
                            todayCompleted={todayCompleted}
                            className="md:col-span-2 lg:col-span-1"
                        />

                        <ProgressCalendar completedDates={completedDates} className="md:col-span-1 lg:col-span-1" />

                        <Card className="md:col-span-2 lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Choose a Surah
                                </CardTitle>
                                <CardDescription>Select a chapter from the Quran to read and record</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SurahList onSurahClick={handleSurahClick} />
                            </CardContent>
                        </Card>

                        <RecordingHistory recordings={recordings} className="md:col-span-2 lg:col-span-2" />

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
                                        <span className="font-medium">{recordings?.length ?? 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">This Month</span>
                                        <span className="font-medium">
                                            {recordings?.filter((r) => new Date(r.created_at * 1000).getMonth() === new Date().getMonth()).length ?? 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Success Rate</span>
                                        <span className="font-medium">
                                            {(recordings?.length ?? 0) > 0 ? Math.round((completedDates.length / new Date().getDate()) * 100) : 0}%
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
