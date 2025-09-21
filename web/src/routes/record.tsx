import { useMediaRecorder } from '@/hooks/use-media-recorder'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { BookOpen, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecordingControls } from '@/components/custom/recording-controls'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { appFetch } from '@/lib/app-fetch'

export const Route = createFileRoute('/record')({
    component: RouteComponent,
})

function RouteComponent() {
    return <RecordPage />
}

function RecordPage() {
    const recorder = useMediaRecorder()
    const { toast } = useToast()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const uploadRecording = useMutation({
        mutationFn: async (audioBlob: Blob) => {
            const formData = new FormData()
            const fileName = `recording_${Date.now()}.webm`
            formData.append("audio", audioBlob, fileName)
            formData.append("note", "Daily Quran reading")

            // Use direct fetch instead of RPC client for file uploads
            // because my rpc client not handle formData properly
            // my rpc send request as application/json and content length: 0
            const response = await appFetch('http://localhost:5555/api/v1/recordings/upload', {
                method: 'POST',
                body: formData,
            })
            return response.json()
        },
        onSuccess: () => {
            toast({
                title: "Recording submitted!",
                description: "Your daily Quran reading has been saved successfully.",
            })
            recorder.clearRecording()

            queryClient.invalidateQueries({ queryKey: ['recordings'] })
            queryClient.invalidateQueries({ queryKey: ['streaks'] })
            navigate({ to: "/dashboard" })
        },
        onError: () => {
            toast({
                title: "Upload failed",
                description: "Failed to save your recording. Please try again.",
                variant: "destructive",
            })
        },
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate({ to: "/dashboard" })}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </div>
                <Card>
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-primary rounded-full">
                                <BookOpen className="h-8 w-8 text-primary-foreground" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-bold">Daily Quran Recording</CardTitle>
                        <CardDescription>Record your daily Quran reading to maintain your streak</CardDescription>
                    </CardHeader>
                </Card>

                <RecordingControls
                    recorder={recorder}
                    onSubmit={async (blob) => {
                        await uploadRecording.mutateAsync(blob)
                    }}
                    isSubmitting={uploadRecording.isPending}
                />
                <Card>
                    <CardContent className="p-6">
                        <div className="text-center space-y-2">
                            <h3 className="font-semibold">Today's Goal</h3>
                            <p className="text-sm text-muted-foreground">
                                Complete your daily Quran reading to maintain your streak
                            </p>
                            <div className="flex justify-center items-center gap-2 mt-4">
                                <div className="w-3 h-3 bg-primary rounded-full" />
                                <span className="text-sm">
                                    {uploadRecording.isPending ? "Uploading..." : "Ready to record"}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

