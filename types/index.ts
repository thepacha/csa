export * from './database'

export interface TranscriptionJob {
  id: string
  title: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  originalFilename: string
  fileSize: number
  duration?: number
  transcriptText?: string
  language?: string
  confidenceScore?: number
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  subscriptionTier: 'free' | 'pro' | 'enterprise'
  creditsRemaining: number
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  credits: number
  features: string[]
  stripePriceId: string
}

export interface AudioFile {
  file: File
  duration?: number
  size: number
}

export interface TranscriptionSettings {
  language?: string
  model?: 'whisper-1'
  temperature?: number
  prompt?: string
}