// Supabase Storage utilities for asset management
import { supabase } from './supabase'

export const STORAGE_BUCKETS = {
    ASSETS: 'star-assets',
    AVATARS: 'avatars',
    MEDIA: 'media'
} as const

export const getStorageUrl = (bucket: string, path: string): string => {
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

// Legacy Azure Blob Storage URL mappings (for migration)
export const AZURE_TO_SUPABASE_ASSETS = {
    'https://stt2ynjil2jmuuu.blob.core.windows.net/assets/blank_tarot.png': () => getAssetUrl('blank_tarot.png'),
    'https://stt2ynjil2jmuuu.blob.core.windows.net/assets/whoosh-flame-388763.mp3': () => getAssetUrl('whoosh-flame-388763.mp3'),
    'https://stt2ynjil2jmuuu.blob.core.windows.net/assets/whoosh-truck-2-386138.mp3': () => getAssetUrl('whoosh-truck-2-386138.mp3'),
    'https://stt2ynjil2jmuuu.blob.core.windows.net/assets/whoosh-axe-throw-389751.mp3': () => getAssetUrl('whoosh-axe-throw-389751.mp3'),
    'https://stt2ynjil2jmuuu.blob.core.windows.net/assets/whoosh-velocity-383019.mp3': () => getAssetUrl('whoosh-velocity-383019.mp3'),
    'https://stt2ynjil2jmuuu.blob.core.windows.net/assets/whoosh-dark-tension-386134.mp3': () => getAssetUrl('whoosh-dark-tension-386134.mp3'),
    'https://star-assets.blob.core.windows.net/star-assets/whoosh-flame-388763.mp3': () => getAssetUrl('whoosh-flame-388763.mp3'),
    'https://star-assets.blob.core.windows.net/star-assets/whoosh-dark-tension-386134.mp3': () => getAssetUrl('whoosh-dark-tension-386134.mp3'),
    'https://star-assets.blob.core.windows.net/star-assets/blank_tarot.png': () => getAssetUrl('blank_tarot.png'),
} as const

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