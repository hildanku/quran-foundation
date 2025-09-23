import { useMediaRecorder } from '@/hooks/use-media-recorder'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'
import { BookOpen, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecordingControls } from '@/components/custom/recording-controls'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { appFetch } from '@/lib/app-fetch'
import Loading from '@/components/ui/loading'
import { BASE_URL } from '@/lib/constant'
import { requireAuth } from '@/lib/auth-guard'


export const Route = createFileRoute('/record')({
    beforeLoad: async () => {
        await requireAuth()
    },
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>) => ({
        surahId: search.surahId as number | undefined,
        surahName: search.surahName as string | undefined,
    }),
})

function RouteComponent() {
    return <RecordPage />
}

function RecordPage() {
    const recorder = useMediaRecorder()
    const { toast } = useToast()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { surahId, surahName } = Route.useSearch()

    const {
        data: versesResult,
        isLoading: isVersesLoading,
        isError: isVersesError,
    } = useQuery({
        queryKey: ['verses', surahId],
        queryFn: async () => {
            if (!surahId) return null

            // Use direct fetch to avoid TypeScript issues with dynamic RPC client keys
            const queryParams = new URLSearchParams({
                per_page: '50',
                words: 'true',
                language: 'en',
                translations: '131'
            })

            const response = await appFetch(
                `${BASE_URL}/api/v1/surahs/${surahId}/verses?${queryParams.toString()}`
            )
            return response.json()
        },
        enabled: !!surahId
    })

    const verses = versesResult?.result?.verses || []

    const uploadRecording = useMutation({
        mutationFn: async (audioBlob: Blob) => {
            const formData = new FormData()
            const fileName = `recording_${Date.now()}.webm`
            formData.append("audio", audioBlob, fileName)
            formData.append("note", surahName ? `Reading of ${surahName}` : "Daily Quran reading")

            if (surahId) {
                formData.append("chapter_id", surahId.toString())
            }

            // Use direct fetch instead of RPC client for file uploads
            // because my rpc client not handle formData properly
            // my rpc send request as application/json and content length: 0
            const response = await appFetch(`${BASE_URL}/api/v1/recordings/upload`, {
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
                        <CardTitle className="text-2xl font-bold">
                            {surahName ? `Recording: ${surahName}` : 'Daily Quran Recording'}
                        </CardTitle>
                        <CardDescription>
                            {surahName
                                ? `Record your reading of ${surahName} to maintain your streak`
                                : 'Record your daily Quran reading to maintain your streak'
                            }
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Surah Content */}
                {surahId && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Surah Content</CardTitle>
                            <CardDescription>
                                Read and record the verses below
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isVersesLoading ? (
                                <Loading />
                            ) : isVersesError ? (
                                <div className="text-center text-red-500">
                                    <p>Failed to load verses. Please try again.</p>
                                </div>
                            ) : verses.length > 0 ? (
                                <div className="h-96 overflow-y-auto border rounded-md p-4">
                                    <div className="space-y-4">
                                        {verses.map((verse: any) => {
                                            return (
                                                <div key={verse.id} className="border-b pb-4 last:border-b-0">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                                                            {verse.verse_number}
                                                        </div>
                                                        <div className="flex-1 space-y-3">
                                                            <div className="text-right text-2xl leading-loose" dir="rtl" style={{ fontFamily: "'Amiri', 'Noto Sans Arabic', serif" }}>
                                                                {verse.text_uthmani || `Verse ${verse.verse_number}`}
                                                            </div>
                                                            {verse.translations && verse.translations.length > 0 && (
                                                                <div className="text-sm text-muted-foreground leading-relaxed">
                                                                    {verse.translations[0].text}
                                                                </div>
                                                            )}
                                                            <div className="text-xs text-muted-foreground">
                                                                {verse.verse_key}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    <p>No verses found for this surah.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

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
                            <h3 className="font-semibold">
                                {surahName ? `Recording ${surahName}` : "Today's Goal"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {surahName
                                    ? `Complete your reading of ${surahName} to maintain your streak`
                                    : "Complete your daily Quran reading to maintain your streak"
                                }
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

