import { createClient } from '@supabase/supabase-js'

// Use new API keys directly (fallback to environment variables)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tvzcqwdnsyqjglmwklkk.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qYf-tav14oF7rIPCqy2a5w_b-dpE-7R'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_wFhuNitFfjI6NUMCfODt6A_hIicAJMp'

// Client for client-side operations (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations (uses service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          password_hash: string
          role: 'admin' | 'user'
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          username: string
          password_hash: string
          role?: 'admin' | 'user'
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          username?: string
          password_hash?: string
          role?: 'admin' | 'user'
          created_at?: string
          created_by?: string | null
        }
      }
      catalog_items: {
        Row: {
          id: string
          name: string
          brand: string
          description: string | null
          price: number | null
          sku: string | null
          grade: string | null
          min_qty: number
          category: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          brand: string
          description?: string | null
          price?: number | null
          sku?: string | null
          grade?: string | null
          min_qty?: number
          category?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string
          description?: string | null
          price?: number | null
          sku?: string | null
          grade?: string | null
          min_qty?: number
          category?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      system_settings: {
        Row: {
          id: string
          settings: any
          updated_at: string
        }
        Insert: {
          id?: string
          settings: any
          updated_at?: string
        }
        Update: {
          id?: string
          settings?: any
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          timestamp: string
          level: string
          category: string
          message: string
          username: string | null
          ip_address: string | null
          metadata: any | null
        }
        Insert: {
          id?: string
          timestamp?: string
          level: string
          category: string
          message: string
          username?: string | null
          ip_address?: string | null
          metadata?: any | null
        }
        Update: {
          id?: string
          timestamp?: string
          level?: string
          category?: string
          message?: string
          username?: string | null
          ip_address?: string | null
          metadata?: any | null
        }
      }
      user_interactions: {
        Row: {
          id: string
          session_id: string
          user_id: string | null
          type: string
          product_id: string | null
          brand: string | null
          search_term: string | null
          timestamp: string
          metadata: any | null
          category: string | null
          contact_form_submitted: boolean | null
          phone_clicked: boolean | null
          whatsapp_clicked: boolean | null
        }
        Insert: {
          id?: string
          session_id: string
          user_id?: string | null
          type: string
          product_id?: string | null
          brand?: string | null
          search_term?: string | null
          timestamp?: string
          metadata?: any | null
          category?: string | null
          contact_form_submitted?: boolean | null
          phone_clicked?: boolean | null
          whatsapp_clicked?: boolean | null
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string | null
          type?: string
          product_id?: string | null
          brand?: string | null
          search_term?: string | null
          timestamp?: string
          metadata?: any | null
          category?: string | null
          contact_form_submitted?: boolean | null
          phone_clicked?: boolean | null
          whatsapp_clicked?: boolean | null
        }
      }
      product_metrics: {
        Row: {
          product_id: string
          views: number
          clicks: number
          searches: number
          last_updated: string
        }
        Insert: {
          product_id: string
          views?: number
          clicks?: number
          searches?: number
          last_updated?: string
        }
        Update: {
          product_id?: string
          views?: number
          clicks?: number
          searches?: number
          last_updated?: string
        }
      }
      dynamic_images: {
        Row: {
          id: string
          device: string
          model: string
          brand: string
          image_urls: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          device: string
          model: string
          brand: string
          image_urls: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          device?: string
          model?: string
          brand?: string
          image_urls?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      banners: {
        Row: {
          id: string
          title: string
          description: string | null
          image_url: string
          link_url: string | null
          link_text: string | null
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          description?: string | null
          image_url: string
          link_url?: string | null
          link_text?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          image_url?: string
          link_url?: string | null
          link_text?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      featured_products: {
        Row: {
          id: string
          product_id: string
          type: 'new' | 'featured'
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          product_id: string
          type: 'new' | 'featured'
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          type?: 'new' | 'featured'
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
