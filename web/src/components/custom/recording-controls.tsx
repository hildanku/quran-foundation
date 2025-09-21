
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Square, Play, Pause, Trash2, Upload } from "lucide-react"
//import type { UseMediaRecorderReturn } from "@/hooks/use-media-recorder"
//import { AudioVisualizer } from "./audio-visualizer"
import type { UseMediaRecorderReturn } from "@/hooks/use-media-recorder"

interface RecordingControlsProps {
    recorder: UseMediaRecorderReturn
    onSubmit?: (audioBlob: Blob) => Promise<void>
    isSubmitting?: boolean
}

export function RecordingControls({ recorder, onSubmit, isSubmitting }: RecordingControlsProps) {
    const {
        isRecording,
        isPaused,
        recordingTime,
        audioBlob,
        audioUrl,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        clearRecording,
        error,
    } = recorder

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const handleSubmit = async () => {
        if (audioBlob && onSubmit) {
            await onSubmit(audioBlob)
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardContent className="p-6 space-y-6">
                {/* Recording Status */}
                <div className="text-center">
                    <div className="text-3xl font-mono font-bold text-primary">{formatTime(recordingTime)}</div>
                    {isRecording && (
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-sm text-muted-foreground">{isPaused ? "Paused" : "Recording..."}</span>
                        </div>
                    )}
                </div>

                {isRecording && (
                    <div className="flex justify-center">
                        {/* <AudioVisualizer isRecording={isRecording && !isPaused} className="w-full max-w-xs" />
                    */}
                    </div>
                )}

                {audioUrl && !isRecording && (
                    <div className="space-y-4">
                        <audio controls src={audioUrl} className="w-full" preload="metadata" />
                    </div>
                )}

                {error && <div className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-lg">{error}</div>}

                <div className="flex justify-center gap-3">
                    {!isRecording && !audioBlob && (
                        <Button onClick={startRecording} size="lg" className="flex items-center gap-2">
                            <Mic className="h-5 w-5" />
                            Start Recording
                        </Button>
                    )}

                    {isRecording && (
                        <>
                            <Button onClick={isPaused ? resumeRecording : pauseRecording} variant="outline" size="lg">
                                {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                            </Button>
                            <Button onClick={stopRecording} variant="destructive" size="lg">
                                <Square className="h-5 w-5" />
                            </Button>
                        </>
                    )}

                    {audioBlob && !isRecording && (
                        <>
                            <Button onClick={clearRecording} variant="outline" size="lg">
                                <Trash2 className="h-5 w-5" />
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="flex items-center gap-2">
                                <Upload className="h-5 w-5" />
                                {isSubmitting ? "Submitting..." : "Submit Recording"}
                            </Button>
                        </>
                    )}
                </div>

                {!isRecording && !audioBlob && (
                    <div className="text-center text-sm text-muted-foreground space-y-1">
                        <p>Find a quiet place and speak clearly</p>
                        <p>Your daily Quran reading will be recorded</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
