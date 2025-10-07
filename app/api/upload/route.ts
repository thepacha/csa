import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { generateTranscriptionTitle, isAudioFile } from '@/lib/utils'
import { MAX_FILE_SIZES } from '@/lib/constants'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check subscription tier
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!isAudioFile(file)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload an audio file.' 
      }, { status: 400 })
    }

    // Check file size based on subscription tier
    const maxSize = MAX_FILE_SIZES[profile.subscription_tier as keyof typeof MAX_FILE_SIZES]
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File size exceeds limit for ${profile.subscription_tier} plan`,
        maxSize,
        currentSize: file.size
      }, { status: 413 })
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueFilename = `${uuidv4()}.${fileExtension}`
    const filePath = `audio/${user.id}/${uniqueFilename}`

    try {
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio-files')
        .getPublicUrl(filePath)

      // Create transcription record
      const transcriptionTitle = title || generateTranscriptionTitle(file.name)
      
      const { data: transcription, error: dbError } = await supabase
        .from('transcriptions')
        .insert({
          user_id: user.id,
          title: transcriptionTitle,
          original_filename: file.name,
          file_url: publicUrl,
          file_size_bytes: file.size,
          status: 'pending'
        })
        .select()
        .single()

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage
          .from('audio-files')
          .remove([filePath])
        
        throw new Error(`Database error: ${dbError.message}`)
      }

      return NextResponse.json({
        success: true,
        transcription: {
          id: transcription.id,
          title: transcription.title,
          originalFilename: transcription.original_filename,
          fileSize: transcription.file_size_bytes,
          status: transcription.status,
          createdAt: transcription.created_at,
        }
      })

    } catch (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ 
        error: 'Failed to upload file',
        details: uploadError instanceof Error ? uploadError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const status = url.searchParams.get('status')
    
    const offset = (page - 1) * limit

    let query = supabase
      .from('transcriptions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: transcriptions, error, count } = await query

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }

    return NextResponse.json({
      transcriptions: transcriptions?.map(t => ({
        id: t.id,
        title: t.title,
        originalFilename: t.original_filename,
        status: t.status,
        fileSize: t.file_size_bytes,
        duration: t.duration_seconds,
        transcriptText: t.transcript_text,
        language: t.language,
        confidenceScore: t.confidence_score,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      })) || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}