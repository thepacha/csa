export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 100,
    features: [
      '100 minutes of transcription',
      'Basic accuracy',
      'Standard support',
      'File upload up to 25MB'
    ],
    stripePriceId: '',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 19,
    credits: 1000,
    features: [
      '1000 minutes of transcription',
      'High accuracy',
      'Priority support',
      'File upload up to 100MB',
      'Custom vocabulary',
      'Speaker identification'
    ],
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    credits: 10000,
    features: [
      '10000 minutes of transcription',
      'Highest accuracy',
      '24/7 support',
      'File upload up to 500MB',
      'Custom vocabulary',
      'Speaker identification',
      'API access',
      'Bulk processing',
      'Custom integrations'
    ],
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
  },
} as const

export const MAX_FILE_SIZES = {
  free: 25 * 1024 * 1024, // 25MB
  pro: 100 * 1024 * 1024, // 100MB
  enterprise: 500 * 1024 * 1024, // 500MB
} as const

export const SUPPORTED_AUDIO_FORMATS = [
  'mp3',
  'wav',
  'aac',
  'ogg',
  'webm',
  'flac',
  'm4a',
  'mp4',
] as const

export const TRANSCRIPTION_LANGUAGES = [
  { code: 'auto', name: 'Auto-detect' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
] as const

export const CREDITS_PER_MINUTE = 1

export const API_RATE_LIMITS = {
  free: {
    requests: 10,
    window: 60 * 1000, // 1 minute
  },
  pro: {
    requests: 100,
    window: 60 * 1000, // 1 minute
  },
  enterprise: {
    requests: 1000,
    window: 60 * 1000, // 1 minute
  },
} as const