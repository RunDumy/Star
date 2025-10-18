// Supabase Storage utilities for asset management
import { supabase } from './supabase'

export const STORAGE_BUCKETS = {
    ASSETS: 'star-assets',
    AVATARS: 'avatars',
    MEDIA: 'media'
} as const

export const getStorageUrl = (bucket: string, path: string): string => {
    if (!supabase) {
        // Return a placeholder URL for server-side rendering
        return `/api/placeholder/${bucket}/${path}`
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
}

export const getAssetUrl = (filename: string): string => {
    return getStorageUrl(STORAGE_BUCKETS.ASSETS, filename)
}

export const getAvatarUrl = (filename: string): string => {
    return getStorageUrl(STORAGE_BUCKETS.AVATARS, filename)
}

export const getMediaUrl = (filename: string): string => {
    return getStorageUrl(STORAGE_BUCKETS.MEDIA, filename)
}

// Zodiac icon mappings
export const getZodiacIconUrl = (zodiacSign: string): string => {
    return getAssetUrl(`icons8-${zodiacSign}-100.png`)
}

export const getChineseZodiacIconUrl = (chineseSign: string): string => {
    return getAssetUrl(`icons8-year-of-${chineseSign}-100.png`)
}

export const getElementIconUrl = (element: string): string => {
    return getAssetUrl(`icons8-${element}-100.png`)
}