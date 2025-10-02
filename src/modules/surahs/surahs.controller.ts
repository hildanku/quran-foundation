import { Hono } from 'hono'
import { appResponse } from '@/lib/response.js'
import { SOMETHING_WHEN_WRONG } from '@/lib/constant.js'
import { logger } from '@/config/logging.js'
import { fetchChapters, fetchVersesByChapter, fetchUthmanVersesByChapter } from '@/modules/surahs/surahs.service.js'

export const surahsController = new Hono()
    .get('/', async (c) => {
        try {
            const chapters = await fetchChapters();
            return appResponse(c, 200, 'Surahs fetched successfully', chapters);
        } catch (error) {
            logger.error('Error fetching surahs:', error)

            if (error instanceof Error) {
                if (error.message === 'UNAUTHORIZED') {
                    return appResponse(c, 401, 'Unauthorized access to Quran Foundation API', null)
                } else if (error.message === 'BAD_GATEWAY') {
                    return appResponse(c, 502, 'Bad Gateway - Quran Foundation API is unavailable', null)
                } else if (error.message.includes('QF_CLIENT_ID') || error.message.includes('QF_CLIENT_SECRET')) {
                    return appResponse(c, 500, 'Server configuration error', null)
                }
            }

            return appResponse(c, 500, SOMETHING_WHEN_WRONG, null)
        }
    })
    .get('/:chapterNumber/verses', async (c) => {
        try {
            const chapterNumber = parseInt(c.req.param('chapterNumber'))

            if (isNaN(chapterNumber) || chapterNumber < 1 || chapterNumber > 114) {
                return appResponse(c, 400, 'Invalid chapter number. Must be between 1 and 114.', null)
            }

            // Get query parameters
            const language = c.req.query('language') || 'en'
            const words = c.req.query('words') !== 'false'  // default true unless explicitly false
            const translations = c.req.query('translations')
            const page = parseInt(c.req.query('page') || '1')
            const per_page = parseInt(c.req.query('per_page') || '10')

            // Get Uthmani text (proper Arabic script)
            const uthmanVersesResult = await fetchUthmanVersesByChapter(chapterNumber)
            const uthmanVerses = uthmanVersesResult.verses || []

            // Get verses with translations and word-by-word data
            const detailedVersesResult = await fetchVersesByChapter(chapterNumber, {
                language,
                words,
                translations: translations || '131', // Default to English translation (Sahih International)
                page,
                per_page
            })
            const detailedVerses = detailedVersesResult.verses || []

            // Combine both data sources
            const combinedVerses = detailedVerses.map((detailedVerse: any) => {
                const uthmanVerse = uthmanVerses.find((uv: any) => uv.verse_key === detailedVerse.verse_key)

                // Combine word translations for complete verse translation
                const englishTranslation = detailedVerse.words
                    ?.filter((word: any) => word.char_type_name === 'word' && word.translation?.text)
                    .map((word: any) => word.translation.text)
                    .join(' ') || '';

                return {
                    ...detailedVerse,
                    text_uthmani: uthmanVerse?.text_uthmani || '',
                    translations: englishTranslation ? [{ text: englishTranslation }] : []
                }
            })

            const result = {
                verses: combinedVerses,
                pagination: detailedVersesResult.pagination || {
                    per_page: combinedVerses.length,
                    current_page: 1,
                    next_page: null,
                    total_pages: 1,
                    total_records: combinedVerses.length
                }
            }

            return appResponse(c, 200, 'Verses fetched successfully', result);
        } catch (error) {
            logger.error('Error fetching verses:', error)

            if (error instanceof Error) {
                if (error.message === 'UNAUTHORIZED') {
                    return appResponse(c, 401, 'Unauthorized access to Quran Foundation API', null)
                } else if (error.message === 'BAD_GATEWAY') {
                    return appResponse(c, 502, 'Bad Gateway - Quran Foundation API is unavailable', null)
                } else if (error.message.includes('QF_CLIENT_ID') || error.message.includes('QF_CLIENT_SECRET')) {
                    return appResponse(c, 500, 'Server configuration error', null)
                }
            }

            return appResponse(c, 500, SOMETHING_WHEN_WRONG, null)
        }
    })
