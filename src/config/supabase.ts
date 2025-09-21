import { createClient } from '@supabase/supabase-js'
import { logger } from './logging.js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl) {
    logger.error('Missing SUPABASE_URL environment variable')
    throw new Error('Missing SUPABASE_URL environment variable')
}

if (!supabaseKey) {
    logger.error('Missing SUPABASE_ANON_KEY environment variable')
    throw new Error('Missing SUPABASE_ANON_KEY environment variable')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'recordings'