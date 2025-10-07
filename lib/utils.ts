import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    audio.preload = 'metadata'
    
    audio.onloadedmetadata = () => {
      resolve(audio.duration)
    }
    
    audio.onerror = () => {
      reject(new Error('Failed to load audio metadata'))
    }
    
    audio.src = URL.createObjectURL(file)
  })
}

export function isAudioFile(file: File): boolean {
  const audioTypes = [
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/aac',
    'audio/ogg',
    'audio/webm',
    'audio/flac',
    'audio/x-flac',
    'audio/m4a',
    'audio/mp4',
  ]
  
  return audioTypes.includes(file.type)
}

export function generateTranscriptionTitle(filename: string): string {
  // Remove file extension and clean up the name
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
  
  // Replace underscores and hyphens with spaces
  const cleaned = nameWithoutExt.replace(/[_-]/g, ' ')
  
  // Capitalize first letter of each word
  return cleaned.replace(/\b\w/g, l => l.toUpperCase())
}