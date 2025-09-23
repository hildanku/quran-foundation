export const NOT_FOUND = 'Not Found'
export const FOUND = 'Found'
export const SOMETHING_WHEN_WRONG = 'something when wrong'

// Quran Foundation API URLs
export const QURAN_FOUNDATION_OAUTH_BASE_URL = process.env.QF_OAUTH_BASE_URL || 'https://prelive-oauth2.quran.foundation'
export const QURAN_FOUNDATION_API_BASE_URL = process.env.QF_API_BASE_URL || 'https://apis-prelive.quran.foundation'

// API Service Quran Endpoints
export const OAUTH_TOKEN_ENDPOINT = '/oauth2/token'
export const CHAPTERS_ENDPOINT = '/content/api/v4/chapters'
export const VERSES_BY_CHAPTER_ENDPOINT = '/content/api/v4/verses/by_chapter'
export const UTHMANI_VERSES_ENDPOINT = '/content/api/v4/quran/verses/uthmani'
