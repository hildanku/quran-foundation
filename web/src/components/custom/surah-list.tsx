"use client"

import { useQuery } from "@tanstack/react-query"
import { client } from "@/lib/rpc"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BookOpen, MapPin, RefreshCw, Search, Filter, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import type { Surah } from "@/types"

interface SurahListProps {
    className?: string
    onSurahClick?: (surah: Surah) => void
}

// Helper function to highlight search terms
function highlightText(text: string, searchQuery: string) {
    if (!searchQuery.trim()) return text

    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)

    return (
        <>
            {parts.map((part, index) =>
                regex.test(part) ? (
                    <mark key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    )
}

export function SurahList({ className, onSurahClick }: SurahListProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [revelationFilter, setRevelationFilter] = useState<"all" | "makkah" | "madinah">("all")
    const [sortBy, setSortBy] = useState<"number" | "name" | "verses">("number")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

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

    // Filter and search logic - moved before conditional returns to follow Rules of Hooks
    const filteredAndSortedSurahs = useMemo(() => {
        const surahs = data?.result?.chapters || []
        
        let filtered = surahs.filter((surah: any) => {
            
            const matchesSearch = searchQuery === "" ||
                surah.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) ||
                surah.translated_name.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                surah.name_arabic.includes(searchQuery) ||
                surah.id.toString().includes(searchQuery)

            const matchesRevelation = revelationFilter === "all" ||
                surah.revelation_place.toLowerCase() === revelationFilter

            return matchesSearch && matchesRevelation
        })

        // Sort logic
        return filtered.sort((a: any, b: any) => {
            switch (sortBy) {
                case "name":
                    return a.name_simple.localeCompare(b.name_simple)
                case "verses":
                    return b.verses_count - a.verses_count
                case "number":
                default:
                    return a.id - b.id
            }
        })
    }, [data, searchQuery, revelationFilter, sortBy])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, revelationFilter, sortBy, itemsPerPage])

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

    // Pagination logic
    const totalPages = Math.ceil(filteredAndSortedSurahs.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentPageSurahs = filteredAndSortedSurahs.slice(startIndex, endIndex)

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const showPages = 5 // Show 5 page numbers at most

        if (totalPages <= showPages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push('...')
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push('...')
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                pages.push(1)
                pages.push('...')
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i)
                }
                pages.push('...')
                pages.push(totalPages)
            }
        }

        return pages
    }

    return (
        <div className={className}>
            {/* Search and Filter Controls */}
            <div className="mb-6 space-y-4">
                {/* Search Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search surah by name, translation, or number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Revelation Place Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-1 sm:gap-2">
                                <Filter className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    {revelationFilter === "all" ? "All Places" :
                                        revelationFilter === "makkah" ? "Meccan" : "Medinan"}
                                </span>
                                <span className="sm:hidden">
                                    {revelationFilter === "all" ? "All" :
                                        revelationFilter === "makkah" ? "Mec" : "Med"}
                                </span>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setRevelationFilter("all")}>
                                All Places
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRevelationFilter("makkah")}>
                                Meccan
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setRevelationFilter("madinah")}>
                                Medinan
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Sort By Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-1 sm:gap-2">
                                <span className="hidden sm:inline">Sort by:</span>
                                <span className="sm:hidden">Sort:</span>
                                {sortBy === "number" ? "Number" :
                                    sortBy === "name" ? "Name" : "Verses"}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setSortBy("number")}>
                                Surah Number
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy("name")}>
                                Name (A-Z)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortBy("verses")}>
                                Verses Count
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Clear Filters Button - only show if filters are active */}
                    {(searchQuery || revelationFilter !== "all" || sortBy !== "number") && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearchQuery("")
                                setRevelationFilter("all")
                                setSortBy("number")
                            }}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Clear all filters
                        </Button>
                    )}

                    {/* Per Page Selector */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-1 sm:gap-2">
                                <span className="hidden sm:inline">Show:</span>
                                {itemsPerPage}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setItemsPerPage(5)}>
                                5 per page
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setItemsPerPage(10)}>
                                10 per page
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setItemsPerPage(20)}>
                                20 per page
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setItemsPerPage(50)}>
                                50 per page
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Results Count */}
                    <div className="flex items-center text-sm text-muted-foreground ml-auto">
                        {filteredAndSortedSurahs.length} of {data?.result?.chapters?.length || 0} surahs
                        {totalPages > 1 && (
                            <span className="ml-2 text-xs">
                                (Page {currentPage} of {totalPages})
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Surah List */}
            <div className="space-y-3">
                {filteredAndSortedSurahs.length === 0 ? (
                    <Card className="p-6 text-center">
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                                <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">No surahs found</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Try adjusting your search or filter criteria
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchQuery("")
                                    setRevelationFilter("all")
                                    setSortBy("number")
                                }}
                                className="flex items-center gap-2"
                            >
                                Clear filters
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <>
                        {/* Current page results */}
                        {currentPageSurahs.map((surah: any) => (
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
                                                    {highlightText(surah.name_simple, searchQuery)}
                                                </h3>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <MapPin className="h-3 w-3" />
                                                    <span className="capitalize">
                                                        {surah.revelation_place}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {highlightText(surah.translated_name.name, searchQuery)}
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
                        ))
                        }

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-6 space-y-4">
                                {/* Pagination Info */}
                                <div className="text-center text-sm text-muted-foreground">
                                    Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedSurahs.length)} of {filteredAndSortedSurahs.length} surahs
                                </div>

                                {/* Quick Jump to Page (for large datasets) */}
                                {totalPages > 10 && (
                                    <div className="flex items-center justify-center gap-2 text-sm">
                                        <span className="text-muted-foreground">Go to page:</span>
                                        <Input
                                            type="number"
                                            min="1"
                                            max={totalPages}
                                            value={currentPage}
                                            onChange={(e) => {
                                                const page = parseInt(e.target.value)
                                                if (page >= 1 && page <= totalPages) {
                                                    setCurrentPage(page)
                                                }
                                            }}
                                            className="w-16 h-8 text-center"
                                        />
                                        <span className="text-muted-foreground">of {totalPages}</span>
                                    </div>
                                )}

                                {/* Pagination Buttons */}
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                    {/* First Page */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-1"
                                    >
                                        <ChevronsLeft className="h-4 w-4" />
                                        <span className="hidden sm:inline">First</span>
                                    </Button>

                                    {/* Previous Page */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="flex items-center gap-1"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        <span className="hidden sm:inline">Previous</span>
                                    </Button>

                                    {/* Page Numbers */}
                                    <div className="flex items-center gap-1">
                                        {getPageNumbers().map((page, index) => (
                                            page === '...' ? (
                                                <span key={index} className="px-2 py-1 text-muted-foreground">
                                                    ...
                                                </span>
                                            ) : (
                                                <Button
                                                    key={index}
                                                    variant={currentPage === page ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(page as number)}
                                                    className="min-w-[2.5rem]"
                                                >
                                                    {page}
                                                </Button>
                                            )
                                        ))}
                                    </div>

                                    {/* Next Page */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center gap-1"
                                    >
                                        <span className="hidden sm:inline">Next</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>

                                    {/* Last Page */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className="flex items-center gap-1"
                                    >
                                        <span className="hidden sm:inline">Last</span>
                                        <ChevronsRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

