
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Flame, Trophy, Target } from "lucide-react"

interface StreakCounterProps {
    currentStreak: number
    longestStreak: number
    todayCompleted: boolean
    className?: string
}

export function StreakCounter({ currentStreak, longestStreak, todayCompleted, className }: StreakCounterProps) {
    const nextMilestone = Math.ceil((currentStreak + 1) / 10) * 10
    const progressToMilestone = ((currentStreak % 10) / 10) * 100

    return (
        <Card className={className}>
            <CardContent className="p-6">
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Flame className={`h-8 w-8 ${currentStreak > 0 ? "text-orange-500" : "text-muted-foreground"}`} />
                            <span className="text-3xl font-bold text-primary">{currentStreak}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Day Streak</p>
                        {todayCompleted && (
                            <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                ✓ Today completed
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Next milestone</span>
                            <span className="font-medium">{nextMilestone} days</span>
                        </div>
                        <Progress value={progressToMilestone} className="h-2" />
                        <p className="text-xs text-muted-foreground text-center">{10 - (currentStreak % 10)} days to go</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Trophy className="h-4 w-4 text-yellow-500" />
                                <span className="text-lg font-semibold">{longestStreak}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Best Streak</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Target className="h-4 w-4 text-blue-500" />
                                <span className="text-lg font-semibold">{Math.max(0, nextMilestone - currentStreak)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">To Milestone</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
