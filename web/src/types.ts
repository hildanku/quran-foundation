export interface TranslatedName {
    language_name: string
    name: string
}

export interface Surah {
    id: number
    revelation_place: "makkah" | "madinah"
    revelation_order: number
    bismillah_pre: boolean
    name_simple: string
    name_complex: string
    name_arabic: string
    verses_count: number
    pages: [number, number]
    translated_name: TranslatedName
}

export interface SurahsResponse {
    message: string
    result: {
        chapters: Surah[]
    }
}
