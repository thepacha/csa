export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'pro' | 'enterprise'
          credits_remaining: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          credits_remaining?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          credits_remaining?: number
          created_at?: string
          updated_at?: string
        }
      }
      transcriptions: {
        Row: {
          id: string
          user_id: string
          title: string
          original_filename: string
          file_url: string
          transcript_text: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          duration_seconds: number | null
          file_size_bytes: number
          language: string | null
          confidence_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          original_filename: string
          file_url: string
          transcript_text?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          duration_seconds?: number | null
          file_size_bytes: number
          language?: string | null
          confidence_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          original_filename?: string
          file_url?: string
          transcript_text?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          duration_seconds?: number | null
          file_size_bytes?: number
          language?: string | null
          confidence_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          status: 'active' | 'canceled' | 'incomplete' | 'past_due'
          price_id: string
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status: 'active' | 'canceled' | 'incomplete' | 'past_due'
          price_id: string
          current_period_start: string
          current_period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: 'active' | 'canceled' | 'incomplete' | 'past_due'
          price_id?: string
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          transcription_id: string | null
          action: 'transcription' | 'api_call'
          credits_used: number
          metadata: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transcription_id?: string | null
          action: 'transcription' | 'api_call'
          credits_used: number
          metadata?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transcription_id?: string | null
          action?: 'transcription' | 'api_call'
          credits_used?: number
          metadata?: Record<string, any> | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}