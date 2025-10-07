import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServerClient } from '@/lib/supabase-server'
import { CREDITS_PER_MINUTE } from '@/lib/constants'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check credits
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
    const transcriptionId = formData.get('transcriptionId') as string
    const language = formData.get('language') as string || 'auto'
    const prompt = formData.get('prompt') as string || ''

    if (!file || !transcriptionId) {
      return NextResponse.json({ error: 'Missing file or transcription ID' }, { status: 400 })
    }

    // Update transcription status to processing
    await supabase
      .from('transcriptions')
      .update({ status: 'processing' })
      .eq('id', transcriptionId)
      .eq('user_id', user.id)

    try {
      // Convert File to Buffer for OpenAI API
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      // Create a new File object that OpenAI can process
      const audioFile = new File([buffer], file.name, { type: file.type })

      // Transcribe with OpenAI Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: language === 'auto' ? undefined : language,
        prompt: prompt || undefined,
        response_format: 'verbose_json',
      })

      // Calculate credits used (1 credit per minute, minimum 1)
      const durationMinutes = Math.ceil((transcription.duration || 60) / 60)
      const creditsUsed = Math.max(1, durationMinutes * CREDITS_PER_MINUTE)

      // Check if user has enough credits
      if (profile.credits_remaining < creditsUsed) {
        await supabase
          .from('transcriptions')
          .update({ 
            status: 'failed',
            transcript_text: 'Insufficient credits'
          })
          .eq('id', transcriptionId)
          .eq('user_id', user.id)

        return NextResponse.json({ 
          error: 'Insufficient credits',
          creditsNeeded: creditsUsed,
          creditsRemaining: profile.credits_remaining
        }, { status: 402 })
      }

      // Update transcription with results
      const { error: updateError } = await supabase
        .from('transcriptions')
        .update({
          status: 'completed',
          transcript_text: transcription.text,
          duration_seconds: transcription.duration,
          language: transcription.language,
          confidence_score: 0.95, // Whisper doesn't provide confidence, using default
        })
        .eq('id', transcriptionId)
        .eq('user_id', user.id)

      if (updateError) {
        throw new Error('Failed to update transcription')
      }

      // Deduct credits from user
      const { error: creditError } = await supabase
        .from('profiles')
        .update({ 
          credits_remaining: profile.credits_remaining - creditsUsed 
        })
        .eq('id', user.id)

      if (creditError) {
        console.error('Failed to deduct credits:', creditError)
      }

      // Log usage
      await supabase
        .from('usage_logs')
        .insert({
          user_id: user.id,
          transcription_id: transcriptionId,
          action: 'transcription',
          credits_used: creditsUsed,
          metadata: {
            duration: transcription.duration,
            language: transcription.language,
            file_size: file.size,
          }
        })

      return NextResponse.json({
        success: true,
        transcription: {
          text: transcription.text,
          duration: transcription.duration,
          language: transcription.language,
        },
        creditsUsed,
        creditsRemaining: profile.credits_remaining - creditsUsed,
      })

    } catch (transcriptionError) {
      console.error('Transcription error:', transcriptionError)
      
      // Update transcription status to failed
      await supabase
        .from('transcriptions')
        .update({ 
          status: 'failed',
          transcript_text: 'Transcription failed'
        })
        .eq('id', transcriptionId)
        .eq('user_id', user.id)

      return NextResponse.json({ 
        error: 'Transcription failed',
        details: transcriptionError instanceof Error ? transcriptionError.message : 'Unknown error'
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