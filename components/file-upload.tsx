'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react'
import { formatFileSize, isAudioFile } from '@/lib/utils'
import { SUPPORTED_AUDIO_FORMATS } from '@/lib/constants'

interface FileUploadProps {
  onUploadComplete: (transcription: any) => void
  maxFileSize: number
  disabled?: boolean
}

export function FileUpload({ onUploadComplete, maxFileSize, disabled }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('')
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`File is too large. Maximum size is ${formatFileSize(maxFileSize)}.`)
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload an audio file.')
      } else {
        setError('File upload failed. Please try again.')
      }
      return
    }

    // Validate audio files
    const validFiles = acceptedFiles.filter(file => {
      if (!isAudioFile(file)) {
        setError('Invalid file type. Please upload an audio file.')
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      setFiles(validFiles)
    }
  }, [maxFileSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': SUPPORTED_AUDIO_FORMATS.map(format => `.${format}`)
    },
    maxFiles: 1,
    maxSize: maxFileSize,
    disabled: disabled || uploading
  })

  const removeFile = (index: number) => {
    setFiles(files => files.filter((_, i) => i !== index))
    setError('')
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)
    setUploadProgress(0)
    setError('')

    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 200)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        clearInterval(progressInterval)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }

        const result = await response.json()
        setUploadProgress(100)
        
        // Clear files and notify parent
        setFiles([])
        onUploadComplete(result.transcription)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setUploadProgress(0)
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className={`border-2 border-dashed transition-colors ${
        isDragActive 
          ? 'border-primary bg-primary/5' 
          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
        <CardContent className="p-8">
          <div {...getRootProps()} className="text-center">
            <input {...getInputProps()} />
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            
            {isDragActive ? (
              <p className="text-lg font-medium text-primary mb-2">
                Drop your audio file here
              </p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Drop your audio file here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports {SUPPORTED_AUDIO_FORMATS.join(', ').toUpperCase()} files up to {formatFileSize(maxFileSize)}
                </p>
              </div>
            )}
            
            {!isDragActive && !disabled && (
              <Button type="button" variant="outline">
                Choose File
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <File className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                {!uploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        </Card>
      )}

      {/* Upload Button */}
      {files.length > 0 && !uploading && (
        <Button 
          onClick={uploadFiles} 
          className="w-full"
          disabled={disabled}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload {files.length} file{files.length > 1 ? 's' : ''}
            </>
          )}
        </Button>
      )}
    </div>
  )
}