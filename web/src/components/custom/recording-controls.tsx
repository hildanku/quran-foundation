
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Square, Play, Pause, Trash2, Upload, AlertCircle } from "lucide-react"
import { useEffect } from "react"
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
        checkMicrophonePermission,
        permissionStatus,
    } = recorder

    // Check microphone permission on component mount
    useEffect(() => {
        checkMicrophonePermission()
    }, [checkMicrophonePermission])

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

                {error && (
                    <div className="text-sm text-destructive text-center bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4" />
                            <span className="font-medium">Microphone Access Required</span>
                        </div>
                        <p className="mb-3">{error}</p>
                        {permissionStatus === 'denied' && (
                            <div className="text-xs space-y-2">
                                <p className="font-medium">To enable microphone access:</p>
                                <div className="text-left space-y-1">
                                    <p>• Click the microphone icon in your browser's address bar</p>
                                    <p>• Select "Allow" and refresh the page</p>
                                    <p>• Or go to browser settings and enable microphone for this site</p>
                                </div>
                            </div>
                        )}
                        {permissionStatus === 'prompt' && (
                            <div className="text-xs">
                                <p>Click "Start Recording" and allow microphone access when prompted.</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-center gap-3">
                    {!isRecording && !audioBlob && (
                        <div className="space-y-3 w-full">
                            {permissionStatus === 'unknown' && !error && (
                                <div className="text-sm text-muted-foreground text-center bg-muted/50 p-3 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Mic className="h-4 w-4" />
                                        <span>Ready to Record</span>
                                    </div>
                                    <p>Click the button below to start recording your Quran recitation.</p>
                                </div>
                            )}
                            <Button 
                                onClick={startRecording} 
                                size="lg" 
                                className="flex items-center gap-2 w-full"
                                disabled={permissionStatus === 'denied'}
                            >
                                <Mic className="h-5 w-5" />
                                Start Recording
                            </Button>
                        </div>
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
