import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sootio - AI Voice Transcription SaaS',
  description: 'Transform your audio into accurate text with our AI-powered transcription service. Fast, reliable, and secure.',
  keywords: ['transcription', 'AI', 'voice to text', 'audio transcription', 'speech recognition'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}