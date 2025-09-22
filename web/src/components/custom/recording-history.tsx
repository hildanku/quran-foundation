
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Calendar, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Recording {
    id: number
    file_url: string
    note: string | null
    created_at: number
    updated_at: number
    user: number | null
}

interface RecordingHistoryProps {
    recordings: Recording[]
    className?: string
}

export function RecordingHistory({ recordings, className }: RecordingHistoryProps) {
    const formatDuration = (url: string) => {
        // WIP: actual duration
        return "2:34"
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Recent Recordings
                </CardTitle>
                <CardDescription>Your latest Quran reading sessions</CardDescription>
            </CardHeader>
            <CardContent>
                {recordings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No recordings yet</p>
                        <p className="text-sm">Start your first daily reading!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recordings.slice(0, 5).map((recording) => (
                            <div key={recording.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">{formatDuration(recording.file_url)}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(recording.created_at * 1000), { addSuffix: true })}
                                    </p>
                                    {recording.note && <p className="text-xs text-muted-foreground mt-1">{recording.note}</p>}
                                </div>
                                <Button size="sm" variant="outline" className="flex items-center gap-1 bg-transparent">
                                    <Play className="h-3 w-3" />
                                    Play
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
