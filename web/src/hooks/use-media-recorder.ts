'use client'

import { useState, useRef, useCallback } from 'react'

export interface UseMediaRecorderReturn {
    isRecording: boolean
    isPaused: boolean
    recordingTime: number
    audioBlob: Blob | null
    audioUrl: string | null
    startRecording: () => Promise<void>
    stopRecording: () => void
    pauseRecording: () => void
    resumeRecording: () => void
    clearRecording: () => void
    error: string | null
}

export function useMediaRecorder(): UseMediaRecorderReturn {
    const [isRecording, setIsRecording] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const startTimer = useCallback(() => {
        timerRef.current = setInterval(() => {
            setRecordingTime((prev) => prev + 1)
        }, 1000)
    }, [])

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }, [])

    const startRecording = useCallback(async () => {
        try {
            setError(null)
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                },
            })

            streamRef.current = stream
            chunksRef.current = []

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm;codecs=opus",
            })

            mediaRecorderRef.current = mediaRecorder

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm;codecs=opus" })
                setAudioBlob(blob)
                setAudioUrl(URL.createObjectURL(blob))

                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((track) => track.stop())
                    streamRef.current = null
                }
            }

            mediaRecorder.start(1000)
            setIsRecording(true)
            setRecordingTime(0)
            startTimer()
        } catch (err) {
            setError("Failed to access microphone. Please check permissions.")
            console.error("Error starting recording:", err)
        }
    }, [startTimer])

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            setIsPaused(false)
            stopTimer()
        }
    }, [isRecording, stopTimer])

    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording && !isPaused) {
            mediaRecorderRef.current.pause()
            setIsPaused(true)
            stopTimer()
        }
    }, [isRecording, isPaused, stopTimer])

    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording && isPaused) {
            mediaRecorderRef.current.resume()
            setIsPaused(false)
            startTimer()
        }
    }, [isRecording, isPaused, startTimer])

    const clearRecording = useCallback(() => {
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl)
        }
        setAudioBlob(null)
        setAudioUrl(null)
        setRecordingTime(0)
        setError(null)
    }, [audioUrl])

    return {
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
    }
}
