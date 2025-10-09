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
    checkMicrophonePermission: () => Promise<void>
    permissionStatus: 'unknown' | 'granted' | 'denied' | 'prompt'
}

export function useMediaRecorder(): UseMediaRecorderReturn {
    const [isRecording, setIsRecording] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'prompt'>('unknown')

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

            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Your browser doesn't support microphone access")
            }

            // Check microphone permission first
            try {
                const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
                setPermissionStatus(permission.state as any)
                
                if (permission.state === 'denied') {
                    setError("Microphone access denied. Please enable microphone permissions in your browser settings.")
                    return
                }

                if (permission.state === 'prompt') {
                    // Show user-friendly message before requesting permission
                    setError("Please allow microphone access when prompted to start recording.")
                }
            } catch (permErr) {
                // Some browsers don't support permissions API, continue with getUserMedia
                console.warn("Permissions API not supported, continuing with getUserMedia", permErr)
                setPermissionStatus('unknown')
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                },
            })

            // Clear any permission-related error once we get the stream
            setError(null)
            setPermissionStatus('granted')

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
        } catch (err: any) {
            console.error("Error starting recording:", err)
            
            // Handle specific getUserMedia errors
            switch (err.name) {
                case 'NotAllowedError':
                case 'PermissionDeniedError':
                    setError("Microphone access denied. Please click the microphone icon in your browser's address bar and allow access, then try again.")
                    break
                case 'NotFoundError':
                case 'DevicesNotFoundError':
                    setError("No microphone found. Please connect a microphone and try again.")
                    break
                case 'NotSupportedError':
                    setError("Your browser doesn't support audio recording. Please try using Chrome, Firefox, or Safari.")
                    break
                case 'NotReadableError':
                    setError("Microphone is being used by another application. Please close other apps using the microphone and try again.")
                    break
                default:
                    setError(err.message || "Failed to access microphone. Please check your browser settings and try again.")
                    break
            }
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

    const checkMicrophonePermission = useCallback(async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError("Your browser doesn't support microphone access")
                setPermissionStatus('denied')
                return
            }

            const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
            setPermissionStatus(permission.state as any)

            // Listen for permission changes
            permission.onchange = () => {
                setPermissionStatus(permission.state as any)
            }

        } catch (error) {
            console.warn("Permissions API not supported", error)
            setPermissionStatus('unknown')
        }
    }, [])

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
        checkMicrophonePermission,
        permissionStatus,
    }
}
