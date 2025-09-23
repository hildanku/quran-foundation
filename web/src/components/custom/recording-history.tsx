
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Calendar, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useState, useRef, useEffect } from "react"

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
    const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState<number | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // const formatDuration = () => {
    //     // WIP: actual duration from audio metadata
    //     return "2:34"
    // }

    const handlePlay = async (recording: Recording) => {
        try {
            // If currently playing this recording, pause it
            if (currentlyPlaying === recording.id) {
                if (audioRef.current) {
                    audioRef.current.pause()
                    setCurrentlyPlaying(null)
                }
                return
            }

            // Stop any currently playing audio
            if (audioRef.current) {
                audioRef.current.pause()
            }

            setIsLoading(recording.id)
            
            // Create new audio element
            const audio = new Audio(recording.file_url)
            audioRef.current = audio

            // Set up event listeners
            audio.addEventListener('loadeddata', () => {
                setIsLoading(null)
                setCurrentlyPlaying(recording.id)
            })

            audio.addEventListener('ended', () => {
                setCurrentlyPlaying(null)
            })

            audio.addEventListener('error', () => {
                setIsLoading(null)
                setCurrentlyPlaying(null)
                console.error('Error playing audio:', recording.file_url)
            })

            await audio.play()
        } catch (error) {
            setIsLoading(null)
            setCurrentlyPlaying(null)
            console.error('Error playing recording:', error)
        }
    }

    // Cleanup
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
        }
    }, [])

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
                                        <span className="text-sm font-medium">1.01</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(recording.created_at * 1000), { addSuffix: true })}
                                    </p>
                                    {recording.note && <p className="text-xs text-muted-foreground mt-1">{recording.note}</p>}
                                </div>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="flex items-center gap-1 bg-transparent"
                                    onClick={() => handlePlay(recording)}
                                    disabled={isLoading === recording.id}
                                >
                                    {isLoading === recording.id ? (
                                        <>
                                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            Loading
                                        </>
                                    ) : currentlyPlaying === recording.id ? (
                                        <>
                                            <Pause className="h-3 w-3" />
                                            Pause
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-3 w-3" />
                                            Play
                                        </>
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
