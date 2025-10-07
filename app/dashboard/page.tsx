'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { FileUpload } from '@/components/file-upload'
import { 
  Upload, 
  FileText, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Play,
  Download,
  Copy
} from 'lucide-react'
import { formatFileSize, formatDuration, formatDate } from '@/lib/utils'
import { MAX_FILE_SIZES } from '@/lib/constants'
import { TranscriptionJob, User } from '@/types'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [transcriptions, setTranscriptions] = useState<TranscriptionJob[]>([])
  const [loading, setLoading] = useState(true)
  const [processingTranscriptions, setProcessingTranscriptions] = useState<Set<string>>(new Set())

  useEffect(() => {
    const getInitialData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) return

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          avatarUrl: profile.avatar_url,
          subscriptionTier: profile.subscription_tier,
          creditsRemaining: profile.credits_remaining,
        })
      }

      // Get recent transcriptions
      await loadTranscriptions()
      setLoading(false)
    }

    getInitialData()
  }, [])

  const loadTranscriptions = async () => {
    try {
      const response = await fetch('/api/upload?limit=5')
      if (response.ok) {
        const data = await response.json()
        setTranscriptions(data.transcriptions || [])
      }
    } catch (error) {
      console.error('Failed to load transcriptions:', error)
    }
  }

  const handleUploadComplete = async (transcription: any) => {
    // Add new transcription to the list
    const newTranscription: TranscriptionJob = {
      id: transcription.id,
      title: transcription.title,
      status: transcription.status,
      progress: 0,
      originalFilename: transcription.originalFilename,
      fileSize: transcription.fileSize,
      createdAt: transcription.createdAt,
      updatedAt: transcription.createdAt,
    }

    setTranscriptions(prev => [newTranscription, ...prev.slice(0, 4)])
    
    // Start transcription process
    startTranscription(transcription.id)
  }

  const startTranscription = async (transcriptionId: string) => {
    setProcessingTranscriptions(prev => new Set(prev).add(transcriptionId))

    try {
      // Get the file for transcription
      const transcription = transcriptions.find(t => t.id === transcriptionId)
      if (!transcription) return

      // Update status to processing
      setTranscriptions(prev => prev.map(t => 
        t.id === transcriptionId 
          ? { ...t, status: 'processing' as const, progress: 10 }
          : t
      ))

      // We need to get the actual file from Supabase storage
      // For now, we'll simulate the transcription process
      // In a real implementation, you'd fetch the file and send it to the API

      const formData = new FormData()
      formData.append('transcriptionId', transcriptionId)
      formData.append('language', 'auto')

      // Note: This is a simplified version. In production, you'd need to
      // fetch the file from storage and append it to the form data
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        
        // Update transcription with results
        setTranscriptions(prev => prev.map(t => 
          t.id === transcriptionId 
            ? { 
                ...t, 
                status: 'completed' as const, 
                progress: 100,
                transcriptText: result.transcription.text,
                duration: result.transcription.duration,
                language: result.transcription.language,
              }
            : t
        ))

        // Update user credits
        if (user) {
          setUser(prev => prev ? {
            ...prev,
            creditsRemaining: result.creditsRemaining
          } : null)
        }
      } else {
        const error = await response.json()
        throw new Error(error.error)
      }
    } catch (error) {
      console.error('Transcription failed:', error)
      
      // Update status to failed
      setTranscriptions(prev => prev.map(t => 
        t.id === transcriptionId 
          ? { ...t, status: 'failed' as const, progress: 0 }
          : t
      ))
    } finally {
      setProcessingTranscriptions(prev => {
        const newSet = new Set(prev)
        newSet.delete(transcriptionId)
        return newSet
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Upload audio files to get started with transcription.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.creditsRemaining || 0}</div>
            <p className="text-xs text-muted-foreground">
              {user?.subscriptionTier.charAt(0).toUpperCase()}{user?.subscriptionTier.slice(1)} plan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transcriptions</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transcriptions.length}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processingTranscriptions.size}</div>
            <p className="text-xs text-muted-foreground">
              Active jobs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">Upload & Transcribe</TabsTrigger>
          <TabsTrigger value="recent">Recent Transcriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Audio File</CardTitle>
              <CardDescription>
                Upload your audio file to start transcription. Supported formats: MP3, WAV, AAC, OGG, and more.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                onUploadComplete={handleUploadComplete}
                maxFileSize={user ? MAX_FILE_SIZES[user.subscriptionTier as keyof typeof MAX_FILE_SIZES] : MAX_FILE_SIZES.free}
                disabled={!user || user.creditsRemaining <= 0}
              />
              
              {user && user.creditsRemaining <= 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    You've run out of credits. Please upgrade your plan to continue transcribing.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transcriptions</CardTitle>
              <CardDescription>
                Your latest transcription jobs and their status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transcriptions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No transcriptions</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by uploading your first audio file.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transcriptions.map((transcription) => (
                    <div key={transcription.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(transcription.status)}
                          <div>
                            <h4 className="font-medium">{transcription.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {transcription.originalFilename} • {formatFileSize(transcription.fileSize)}
                              {transcription.duration && ` • ${formatDuration(transcription.duration)}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(transcription.createdAt)}
                        </div>
                      </div>

                      {transcription.status === 'processing' && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Processing...</span>
                            <span>{transcription.progress}%</span>
                          </div>
                          <Progress value={transcription.progress} className="w-full" />
                        </div>
                      )}

                      {transcription.status === 'completed' && transcription.transcriptText && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Transcript</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(transcription.transcriptText!)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {transcription.transcriptText}
                          </p>
                        </div>
                      )}

                      {transcription.status === 'failed' && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-800">
                            Transcription failed. Please try uploading the file again.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}