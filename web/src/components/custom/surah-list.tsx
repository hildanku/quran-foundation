"use client"

import { useQuery } from "@tanstack/react-query"
import { client } from "@/lib/rpc"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BookOpen, MapPin, RefreshCw } from "lucide-react"
import type { Surah } from "@/types"

interface SurahListProps {
    className?: string
    onSurahClick?: (surah: Surah) => void
}

export function SurahList({ className, onSurahClick }: SurahListProps) {
    const {
        data,
        isLoading,
        error,
        refetch,
        isRefetching,
    } = useQuery({
        queryKey: ["surahs"],
        queryFn: async () => {
            const res = await client.api.v1.surahs.$get()
            return res.json()
        },
        staleTime: 1000 * 60 * 60, // 1h
        gcTime: 1000 * 60 * 60 * 24, // 24h
    })

    console.log(data)

    if (isLoading) {
        return (
            <div className={className}>
                <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="p-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <div className="text-right space-y-2">
                                    <Skeleton className="h-6 w-16 ml-auto" />
                                    <Skeleton className="h-3 w-12 ml-auto" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={className}>
                <Card className="p-6 text-center">
                    <div className="space-y-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <BookOpen className="h-8 w-8 text-red-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Failed to load surahs</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Please check your connection and try again
                            </p>
                        </div>
                        <Button
                            onClick={() => refetch()}
                            disabled={isRefetching}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
                            />
                            Try Again
                        </Button>
                    </div>
                </Card>
            </div>
        )
    }

    const surahs = data?.result.chapters || []

    return (
        <div className={className}>
            <div className="space-y-3">
                {surahs.map((surah: any) => (
                    <Card
                        key={surah.id}
                        className="transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary"
                        onClick={() => onSurahClick?.(surah)}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                {/* Surah Number */}
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <span className="font-bold text-primary text-lg">
                                            {surah.id}
                                        </span>
                                    </div>
                                </div>

                                {/* Surah Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-base truncate">
                                            {surah.name_simple}
                                        </h3>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <MapPin className="h-3 w-3" />
                                            <span className="capitalize">
                                                {surah.revelation_place}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {surah.translated_name.name}
                                    </p>
                                </div>

                                {/* Arabic Name & Verses */}
                                <div className="text-right flex-shrink-0">
                                    <div
                                        className="text-xl font-arabic text-primary mb-1"
                                        dir="rtl"
                                    >
                                        {surah.name_arabic}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {surah.verses_count} verses
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

