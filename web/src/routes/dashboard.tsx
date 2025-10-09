import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from '@/lib/stores/auth'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BookOpen, Mic, Settings, User, LogOut } from 'lucide-react'
import { appFetch } from '@/lib/app-fetch'
import { BASE_URL } from '@/lib/constant'
import { StreakCounter } from '@/components/custom/streak-counter'
import { RecordingHistory } from '@/components/custom/recording-history'
import { ProgressCalendar } from '@/components/custom/progress-calendar'
import { SurahList } from '@/components/custom/surah-list'
import Loading from '@/components/ui/loading'
import { getInitials } from '@/lib/utils'
import { requireAuth } from '@/lib/auth-guard'

export const Route = createFileRoute('/dashboard')({
    beforeLoad: async () => {
        await requireAuth()
    },
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
        isError: _isRecordingsError,
    } = useQuery({
        queryKey: ['recordings'],
        queryFn: async () => {
            const response = await appFetch(`${BASE_URL}/api/v1/recordings/user?limit=10&page=1`)
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
        isError: _isStreaksError,
    } = useQuery({
        queryKey: ['streaks'],
        queryFn: async () => {
            const response = await appFetch(`${BASE_URL}/api/v1/streaks/user`)
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

    const todayCompleted = recordings.some((recording: { created_at: number }) => {
        const date = new Date(recording.created_at * 1000).toISOString().split("T")[0]
        return date === today
    })

    const completedDates = recordings.map((recording: { created_at: number }) =>
        new Date(recording.created_at * 1000).toISOString().split("T")[0],
    )

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
                    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-14 sm:h-16">
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <div className="p-1.5 sm:p-2 bg-primary rounded-lg flex-shrink-0">
                                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h1 className="text-lg sm:text-xl font-bold truncate">DailyQuran</h1>
                                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Welcome back, {user?.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
                                <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/settings" })} className="p-2">
                                    <Settings className="h-4 w-4" />
                                </Button>
                                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                    <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                                    <AvatarFallback className="text-xs sm:text-sm">{user?.name ? getInitials(user.name) : <User className="h-3 w-3 sm:h-4 sm:w-4" />}</AvatarFallback>
                                </Avatar>
                                <Button variant="ghost" size="sm" onClick={handleLogout} className="p-2">
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <Card className="sm:col-span-2 lg:col-span-1">
                            <CardHeader className="pb-3 sm:pb-6">
                                <CardTitle className="text-lg sm:text-xl">Today's Reading</CardTitle>
                                <CardDescription className="text-sm">
                                    {todayCompleted ? "Great job! You've completed today's reading." : "Ready to continue your streak?"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-3 sm:space-y-4">
                                    {todayCompleted ? (
                                        <div className="text-center py-3 sm:py-4">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                                            </div>
                                            <p className="text-xs sm:text-sm text-muted-foreground px-2">You've already recorded today. Come back tomorrow!</p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-3 sm:py-4">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                                <Mic className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                                            </div>
                                            <p className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Ready to Record?</p>
                                            <p className="text-xs sm:text-sm text-muted-foreground px-2">Scroll down to choose a Surah and start your daily recording</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <StreakCounter
                            currentStreak={streaks.current_streak}
                            longestStreak={streaks.longest_streak}
                            todayCompleted={todayCompleted}
                            className="sm:col-span-1 lg:col-span-1"
                        />

                        <ProgressCalendar completedDates={completedDates} className="sm:col-span-1 lg:col-span-1" />

                        <Card className="sm:col-span-2 lg:col-span-3">
                            <CardHeader className="pb-3 sm:pb-6">
                                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Choose a Surah
                                </CardTitle>
                                <CardDescription className="text-sm">Select a chapter from the Quran to read and record</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <SurahList onSurahClick={handleSurahClick} />
                            </CardContent>
                        </Card>

                        <RecordingHistory recordings={recordings} className="sm:col-span-2 lg:col-span-2" />

                        <Card className="sm:col-span-2 lg:col-span-1">
                            <CardHeader className="pb-3 sm:pb-6">
                                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                                    <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                                    Quick Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs sm:text-sm text-muted-foreground">Total Recordings</span>
                                        <span className="font-medium text-sm sm:text-base">{recordings?.length ?? 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs sm:text-sm text-muted-foreground">This Month</span>
                                        <span className="font-medium text-sm sm:text-base">
                                            {recordings?.filter((r: any) => new Date(r.created_at * 1000).getMonth() === new Date().getMonth()).length ?? 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs sm:text-sm text-muted-foreground">Success Rate</span>
                                        <span className="font-medium text-sm sm:text-base">
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
