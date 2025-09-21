
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

interface ProgressCalendarProps {
    completedDates: string[]
    className?: string
}

export function ProgressCalendar({ completedDates, className }: ProgressCalendarProps) {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    const isDateCompleted = (date: number) => {
        const dateStr = new Date(currentYear, currentMonth, date).toISOString().split("T")[0]
        return completedDates.includes(dateStr)
    }

    const isToday = (date: number) => {
        return date === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
    }

    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(<div key={`empty-${i}`} className="w-8 h-8" />)
    }

    // Days of the month
    for (let date = 1; date <= daysInMonth; date++) {
        const completed = isDateCompleted(date)
        const isCurrentDay = isToday(date)

        days.push(
            <div
                key={date}
                className={`
          w-8 h-8 flex items-center justify-center text-xs rounded-full
          ${completed
                        ? "bg-primary text-primary-foreground font-medium"
                        : isCurrentDay
                            ? "bg-secondary border-2 border-primary"
                            : "hover:bg-muted"
                    }
        `}
            >
                {date}
            </div>,
        )
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {monthNames[currentMonth]} {currentYear}
                </CardTitle>
                <CardDescription>Your daily reading progress</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground text-center">
                        <div>Sun</div>
                        <div>Mon</div>
                        <div>Tue</div>
                        <div>Wed</div>
                        <div>Thu</div>
                        <div>Fri</div>
                        <div>Sat</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1">{days}</div>
                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-primary rounded-full" />
                            <span>Completed</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-secondary border border-primary rounded-full" />
                            <span>Today</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
