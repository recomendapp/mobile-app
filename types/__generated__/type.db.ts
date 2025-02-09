export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          stripe_customer_id: string | null
        }
        Insert: {
          id: string
          stripe_customer_id?: string | null
        }
        Update: {
          id?: string
          stripe_customer_id?: string | null
        }
        Relationships: []
      }
      media_stats: {
        Row: {
          id: number
          likes_count: number
          popularity: number | null
          recos_count: number
          review_count: number
          vote_average: number | null
          vote_count: number
          watch_count: number
          watchlist_count: number
        }
        Insert: {
          id: number
          likes_count?: number
          popularity?: number | null
          recos_count?: number
          review_count?: number
          vote_average?: number | null
          vote_count?: number
          watch_count?: number
          watchlist_count?: number
        }
        Update: {
          id?: number
          likes_count?: number
          popularity?: number | null
          recos_count?: number
          review_count?: number
          vote_average?: number | null
          vote_count?: number
          watch_count?: number
          watchlist_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "media_stats_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "media"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "media_stats_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "media_movie"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "media_stats_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "media_person"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "media_stats_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "media_tv_series"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "media_stats_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
        ]
      }
      medias: {
        Row: {
          id: number
          media_type: Database["public"]["Enums"]["media_type"]
          movie_id: number | null
          person_id: number | null
          tv_series_id: number | null
        }
        Insert: {
          id?: number
          media_type: Database["public"]["Enums"]["media_type"]
          movie_id?: number | null
          person_id?: number | null
          tv_series_id?: number | null
        }
        Update: {
          id?: number
          media_type?: Database["public"]["Enums"]["media_type"]
          movie_id?: number | null
          person_id?: number | null
          tv_series_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: true
            referencedRelation: "media_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: true
            referencedRelation: "tmdb_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "media_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "person_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: true
            referencedRelation: "tmdb_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_tv_series_id_fkey"
            columns: ["tv_series_id"]
            isOneToOne: true
            referencedRelation: "media_tv_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_tv_series_id_fkey"
            columns: ["tv_series_id"]
            isOneToOne: true
            referencedRelation: "tmdb_tv_series"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_guests: {
        Row: {
          created_at: string
          edit: boolean
          id: number
          playlist_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          edit?: boolean
          id?: number
          playlist_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          edit?: boolean
          id?: number
          playlist_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_guests_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_guests_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_guests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_guests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_items: {
        Row: {
          comment: string | null
          created_at: string
          id: number
          media_id: number
          playlist_id: number
          rank: number
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: number
          media_id: number
          playlist_id: number
          rank: number
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: number
          media_id?: number
          playlist_id?: number
          rank?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_items_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "playlist_items_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "playlist_items_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "playlist_items_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "playlist_items_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_items_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_items_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          created_at: string
          description: string | null
          id: number
          items_count: number
          likes_count: number
          poster_url: string | null
          private: boolean
          saved_count: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          items_count?: number
          likes_count?: number
          poster_url?: string | null
          private?: boolean
          saved_count?: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          items_count?: number
          likes_count?: number
          poster_url?: string | null
          private?: boolean
          saved_count?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists_featured: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "playlists_featured_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlists_featured_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "playlists_friends"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists_saved: {
        Row: {
          created_at: string
          id: number
          playlist_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          playlist_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          playlist_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlists_saved_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlists_saved_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists_friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlists_saved_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlists_saved_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      prices: {
        Row: {
          active: boolean | null
          currency: string | null
          description: string | null
          id: string
          interval: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count: number | null
          metadata: Json | null
          product_id: string | null
          trial_period_days: number | null
          type: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount: number | null
        }
        Insert: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Update: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          description: string | null
          features: Json | null
          id: string
          image: string | null
          metadata: Json | null
          name: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          features?: Json | null
          id: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          features?: Json | null
          id?: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          created_at: string
          date: string
          id: number
          status: Database["public"]["Enums"]["sync_logs_status"]
          type: Database["public"]["Enums"]["sync_logs_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          date?: string
          id?: number
          status?: Database["public"]["Enums"]["sync_logs_status"]
          type: Database["public"]["Enums"]["sync_logs_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: number
          status?: Database["public"]["Enums"]["sync_logs_status"]
          type?: Database["public"]["Enums"]["sync_logs_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      tmdb_collection: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id?: number
          name?: string | null
        }
        Update: {
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      tmdb_collection_image: {
        Row: {
          aspect_ratio: number | null
          collection: number
          file_path: string
          height: number | null
          id: number
          iso_639_1: string | null
          type: Database["public"]["Enums"]["image_type"]
          vote_average: number | null
          vote_count: number | null
          width: number | null
        }
        Insert: {
          aspect_ratio?: number | null
          collection: number
          file_path: string
          height?: number | null
          id?: number
          iso_639_1?: string | null
          type: Database["public"]["Enums"]["image_type"]
          vote_average?: number | null
          vote_count?: number | null
          width?: number | null
        }
        Update: {
          aspect_ratio?: number | null
          collection?: number
          file_path?: string
          height?: number | null
          id?: number
          iso_639_1?: string | null
          type?: Database["public"]["Enums"]["image_type"]
          vote_average?: number | null
          vote_count?: number | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_collection_image_collection_fkey"
            columns: ["collection"]
            isOneToOne: false
            referencedRelation: "collection"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_collection_image_collection_fkey"
            columns: ["collection"]
            isOneToOne: false
            referencedRelation: "tmdb_collection"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_collection_translation: {
        Row: {
          collection: number
          homepage: string | null
          id: number
          iso_3166_1: string
          iso_639_1: string
          overview: string | null
          title: string | null
        }
        Insert: {
          collection: number
          homepage?: string | null
          id?: number
          iso_3166_1: string
          iso_639_1: string
          overview?: string | null
          title?: string | null
        }
        Update: {
          collection?: number
          homepage?: string | null
          id?: number
          iso_3166_1?: string
          iso_639_1?: string
          overview?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_collection_translation_collection_fkey"
            columns: ["collection"]
            isOneToOne: false
            referencedRelation: "collection"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_collection_translation_collection_fkey"
            columns: ["collection"]
            isOneToOne: false
            referencedRelation: "tmdb_collection"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_company: {
        Row: {
          description: string | null
          headquarters: string | null
          homepage: string | null
          id: number
          name: string | null
          origin_country: string | null
          parent_company: number | null
        }
        Insert: {
          description?: string | null
          headquarters?: string | null
          homepage?: string | null
          id?: number
          name?: string | null
          origin_country?: string | null
          parent_company?: number | null
        }
        Update: {
          description?: string | null
          headquarters?: string | null
          homepage?: string | null
          id?: number
          name?: string | null
          origin_country?: string | null
          parent_company?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_company_parent_company_fkey"
            columns: ["parent_company"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_company_parent_company_fkey"
            columns: ["parent_company"]
            isOneToOne: false
            referencedRelation: "tmdb_company"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_company_alternative_name: {
        Row: {
          company: number
          id: number
          name: string
        }
        Insert: {
          company: number
          id?: number
          name: string
        }
        Update: {
          company?: number
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_company_alternative_name_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_company_alternative_name_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "tmdb_company"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_company_image: {
        Row: {
          aspect_ratio: number | null
          company: number
          file_path: string
          file_type: string
          height: number | null
          id: string
          vote_average: number | null
          vote_count: number | null
          width: number | null
        }
        Insert: {
          aspect_ratio?: number | null
          company: number
          file_path: string
          file_type: string
          height?: number | null
          id: string
          vote_average?: number | null
          vote_count?: number | null
          width?: number | null
        }
        Update: {
          aspect_ratio?: number | null
          company?: number
          file_path?: string
          file_type?: string
          height?: number | null
          id?: string
          vote_average?: number | null
          vote_count?: number | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_company_image_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_company_image_company_fkey"
            columns: ["company"]
            isOneToOne: false
            referencedRelation: "tmdb_company"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_country: {
        Row: {
          iso_3166_1: string
        }
        Insert: {
          iso_3166_1: string
        }
        Update: {
          iso_3166_1?: string
        }
        Relationships: []
      }
      tmdb_department: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      tmdb_department_translation: {
        Row: {
          department: string
          id: number
          language: Database["public"]["Enums"]["language_app"]
        }
        Insert: {
          department: string
          id?: number
          language: Database["public"]["Enums"]["language_app"]
        }
        Update: {
          department?: string
          id?: number
          language?: Database["public"]["Enums"]["language_app"]
        }
        Relationships: []
      }
      tmdb_gender: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      tmdb_genre: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      tmdb_genre_translation: {
        Row: {
          genre: number
          id: number
          language: string
          name: string
        }
        Insert: {
          genre: number
          id?: number
          language: string
          name: string
        }
        Update: {
          genre?: number
          id?: number
          language?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_genre_translation_genre_fkey"
            columns: ["genre"]
            isOneToOne: false
            referencedRelation: "tmdb_genre"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_job: {
        Row: {
          id: number
        }
        Insert: {
          id?: number
        }
        Update: {
          id?: number
        }
        Relationships: []
      }
      tmdb_job_translation: {
        Row: {
          department_id: number
          id: number
          job: string
          language: Database["public"]["Enums"]["language_app"]
        }
        Insert: {
          department_id: number
          id?: number
          job: string
          language: Database["public"]["Enums"]["language_app"]
        }
        Update: {
          department_id?: number
          id?: number
          job?: string
          language?: Database["public"]["Enums"]["language_app"]
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_job_translation_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "tmdb_department"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_keyword: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      tmdb_language: {
        Row: {
          iso_639_1: string
        }
        Insert: {
          iso_639_1: string
        }
        Update: {
          iso_639_1?: string
        }
        Relationships: []
      }
      tmdb_movie: {
        Row: {
          adult: boolean
          belongs_to_collection: number | null
          budget: number
          id: number
          original_language: string | null
          original_title: string | null
          popularity: number
          revenue: number
          status: string | null
          updated_at: string | null
          vote_average: number
          vote_count: number
        }
        Insert: {
          adult?: boolean
          belongs_to_collection?: number | null
          budget?: number
          id?: number
          original_language?: string | null
          original_title?: string | null
          popularity?: number
          revenue?: number
          status?: string | null
          updated_at?: string | null
          vote_average?: number
          vote_count?: number
        }
        Update: {
          adult?: boolean
          belongs_to_collection?: number | null
          budget?: number
          id?: number
          original_language?: string | null
          original_title?: string | null
          popularity?: number
          revenue?: number
          status?: string | null
          updated_at?: string | null
          vote_average?: number
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_movie_collection_fkey"
            columns: ["belongs_to_collection"]
            isOneToOne: false
            referencedRelation: "collection"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_collection_fkey"
            columns: ["belongs_to_collection"]
            isOneToOne: false
            referencedRelation: "tmdb_collection"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_movie_alternative_titles: {
        Row: {
          id: number
          iso_3166_1: string
          movie_id: number
          title: string
          type: string | null
        }
        Insert: {
          id?: number
          iso_3166_1: string
          movie_id: number
          title: string
          type?: string | null
        }
        Update: {
          id?: number
          iso_3166_1?: string
          movie_id?: number
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_movie_alternative_title_movie_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_alternative_title_movie_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_movie"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_movie_credits: {
        Row: {
          department: string
          id: string
          job: string
          movie_id: number
          person_id: number
        }
        Insert: {
          department: string
          id: string
          job: string
          movie_id: number
          person_id: number
        }
        Update: {
          department?: string
          id?: string
          job?: string
          movie_id?: number
          person_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_movie_credits_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "tmdb_person"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_movie_external_ids: {
        Row: {
          id: number
          movie_id: number
          source: string
          value: string
        }
        Insert: {
          id?: number
          movie_id: number
          source: string
          value: string
        }
        Update: {
          id?: number
          movie_id?: number
          source?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_movie_external_ids_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_external_ids_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_movie"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_movie_genres: {
        Row: {
          genre_id: number
          id: number
          movie_id: number
        }
        Insert: {
          genre_id: number
          id?: number
          movie_id: number
        }
        Update: {
          genre_id?: number
          id?: number
          movie_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_movie_genre_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "tmdb_genre"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_genre_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_genre_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_movie"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_movie_images: {
        Row: {
          aspect_ratio: number
          file_path: string
          height: number
          id: number
          iso_639_1: string | null
          movie_id: number
          type: Database["public"]["Enums"]["image_type"]
          vote_average: number
          vote_count: number
          width: number
        }
        Insert: {
          aspect_ratio?: number
          file_path: string
          height?: number
          id?: number
          iso_639_1?: string | null
          movie_id: number
          type: Database["public"]["Enums"]["image_type"]
          vote_average?: number
          vote_count?: number
          width?: number
        }
        Update: {
          aspect_ratio?: number
          file_path?: string
          height?: number
          id?: number
          iso_639_1?: string | null
          movie_id?: number
          type?: Database["public"]["Enums"]["image_type"]
          vote_average?: number
          vote_count?: number
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_movie_images_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_images_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_movie"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_movie_keywords: {
        Row: {
          id: number
          keyword_id: number
          movie_id: number
        }
        Insert: {
          id?: number
          keyword_id: number
          movie_id: number
        }
        Update: {
          id?: number
          keyword_id?: number
          movie_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_movie_keyword_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "tmdb_keyword"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_keyword_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_keyword_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_movie"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_movie_origin_country: {
        Row: {
          id: number
          iso_3166_1: string
          movie_id: number
        }
        Insert: {
          id?: number
          iso_3166_1: string
          movie_id: number
        }
        Update: {
          id?: number
          iso_3166_1?: string
          movie_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_movie_origin_country_country_fkey"
            columns: ["iso_3166_1"]
            isOneToOne: false
            referencedRelation: "tmdb_country"
            referencedColumns: ["iso_3166_1"]
          },
          {
            foreignKeyName: "tmdb_movie_origin_country_movie_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_origin_country_movie_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_movie"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_movie_production_companies: {
        Row: {
          company_id: number
          id: number
          movie_id: number
        }
        Insert: {
          company_id: number
          id?: number
          movie_id: number
        }
        Update: {
          company_id?: number
          id?: number
          movie_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_movie_production_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_production_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "tmdb_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_production_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_production_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_movie"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_movie_production_countries: {
        Row: {
          id: number
          iso_3166_1: string
          movie_id: number
        }
        Insert: {
          id?: number
          iso_3166_1: string
          movie_id: number
        }
        Update: {
          id?: number
          iso_3166_1?: string
          movie_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_movie_country_country_id_fkey"
            columns: ["iso_3166_1"]
            isOneToOne: false
            referencedRelation: "tmdb_country"
            referencedColumns: ["iso_3166_1"]
          },
          {
            foreignKeyName: "tmdb_movie_country_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_country_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_movie"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_movie_release_dates: {
        Row: {
          certification: string | null
          descriptors: string[] | null
          id: number
          iso_3166_1: string
          iso_639_1: string | null
          movie_id: number
          note: string | null
          release_date: string
          release_type: number
        }
        Insert: {
          certification?: string | null
          descriptors?: string[] | null
          id?: number
          iso_3166_1: string
          iso_639_1?: string | null
          movie_id: number
          note?: string | null
          release_date: string
          release_type: number
        }
        Update: {
          certification?: string | null
          descriptors?: string[] | null
          id?: number
          iso_3166_1?: string
          iso_639_1?: string | null
          movie_id?: number
          note?: string | null
          release_date?: string
          release_type?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_movie_release_dates_iso_3166_1_fkey"
            columns: ["iso_3166_1"]
            isOneToOne: false
            referencedRelation: "tmdb_country"
            referencedColumns: ["iso_3166_1"]
          },
          {
            foreignKeyName: "tmdb_movie_release_dates_iso_639_1_fkey"
            columns: ["iso_639_1"]
            isOneToOne: false
            referencedRelation: "tmdb_language"
            referencedColumns: ["iso_639_1"]
          },
          {
            foreignKeyName: "tmdb_movie_release_dates_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_release_dates_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_movie"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_movie_roles: {
        Row: {
          character: string | null
          credit_id: string
          order: number
        }
        Insert: {
          character?: string | null
          credit_id: string
          order: number
        }
        Update: {
          character?: string | null
          credit_id?: string
          order?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_movie_role_credit_id_fkey"
            columns: ["credit_id"]
            isOneToOne: true
            referencedRelation: "tmdb_movie_credits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_role_credit_id_fkey"
            columns: ["credit_id"]
            isOneToOne: true
            referencedRelation: "tmdb_movie_credits_random"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_movie_spoken_languages: {
        Row: {
          id: number
          iso_639_1: string
          movie_id: number
        }
        Insert: {
          id?: number
          iso_639_1: string
          movie_id: number
        }
        Update: {
          id?: number
          iso_639_1?: string
          movie_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_movie_language_language_id_fkey"
            columns: ["iso_639_1"]
            isOneToOne: false
            referencedRelation: "tmdb_language"
            referencedColumns: ["iso_639_1"]
          },
          {
            foreignKeyName: "tmdb_movie_language_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_language_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_movie"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_movie_translations: {
        Row: {
          homepage: string | null
          id: number
          iso_3166_1: string
          iso_639_1: string
          movie_id: number
          overview: string | null
          runtime: number
          tagline: string | null
          title: string | null
        }
        Insert: {
          homepage?: string | null
          id?: number
          iso_3166_1: string
          iso_639_1: string
          movie_id: number
          overview?: string | null
          runtime?: number
          tagline?: string | null
          title?: string | null
        }
        Update: {
          homepage?: string | null
          id?: number
          iso_3166_1?: string
          iso_639_1?: string
          movie_id?: number
          overview?: string | null
          runtime?: number
          tagline?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_movie_translation_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_translation_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_movie"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_movie_videos: {
        Row: {
          id: string
          iso_3166_1: string | null
          iso_639_1: string | null
          key: string
          movie_id: number
          name: string | null
          official: boolean
          published_at: string
          site: string
          size: number | null
          type: string | null
        }
        Insert: {
          id: string
          iso_3166_1?: string | null
          iso_639_1?: string | null
          key: string
          movie_id: number
          name?: string | null
          official: boolean
          published_at: string
          site: string
          size?: number | null
          type?: string | null
        }
        Update: {
          id?: string
          iso_3166_1?: string | null
          iso_639_1?: string | null
          key?: string
          movie_id?: number
          name?: string | null
          official?: boolean
          published_at?: string
          site?: string
          size?: number | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_movie_videos_iso_3166_1_fkey"
            columns: ["iso_3166_1"]
            isOneToOne: false
            referencedRelation: "tmdb_country"
            referencedColumns: ["iso_3166_1"]
          },
          {
            foreignKeyName: "tmdb_movie_videos_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_videos_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_movie"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_network: {
        Row: {
          headquarters: string | null
          homepage: string | null
          id: number
          name: string
          origin_country: string | null
        }
        Insert: {
          headquarters?: string | null
          homepage?: string | null
          id?: number
          name: string
          origin_country?: string | null
        }
        Update: {
          headquarters?: string | null
          homepage?: string | null
          id?: number
          name?: string
          origin_country?: string | null
        }
        Relationships: []
      }
      tmdb_network_alternative_name: {
        Row: {
          id: number
          name: string
          network: number
          type: string | null
        }
        Insert: {
          id?: number
          name: string
          network: number
          type?: string | null
        }
        Update: {
          id?: number
          name?: string
          network?: number
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_network_alternative_name_network_fkey"
            columns: ["network"]
            isOneToOne: false
            referencedRelation: "tmdb_network"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_network_image: {
        Row: {
          aspect_ratio: number | null
          file_path: string
          file_type: string
          height: number | null
          id: string
          network: number
          vote_average: number | null
          vote_count: number | null
          width: number | null
        }
        Insert: {
          aspect_ratio?: number | null
          file_path: string
          file_type: string
          height?: number | null
          id: string
          network: number
          vote_average?: number | null
          vote_count?: number | null
          width?: number | null
        }
        Update: {
          aspect_ratio?: number | null
          file_path?: string
          file_type?: string
          height?: number | null
          id?: string
          network?: number
          vote_average?: number | null
          vote_count?: number | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_network_image_network_fkey"
            columns: ["network"]
            isOneToOne: false
            referencedRelation: "tmdb_network"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_person: {
        Row: {
          adult: boolean
          birthday: string | null
          deathday: string | null
          gender: number | null
          homepage: string | null
          id: number
          imdb_id: string | null
          known_for_department: string | null
          name: string | null
          place_of_birth: string | null
          popularity: number | null
        }
        Insert: {
          adult?: boolean
          birthday?: string | null
          deathday?: string | null
          gender?: number | null
          homepage?: string | null
          id?: number
          imdb_id?: string | null
          known_for_department?: string | null
          name?: string | null
          place_of_birth?: string | null
          popularity?: number | null
        }
        Update: {
          adult?: boolean
          birthday?: string | null
          deathday?: string | null
          gender?: number | null
          homepage?: string | null
          id?: number
          imdb_id?: string | null
          known_for_department?: string | null
          name?: string | null
          place_of_birth?: string | null
          popularity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_person_gender_fkey"
            columns: ["gender"]
            isOneToOne: false
            referencedRelation: "tmdb_gender"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_person_also_known_as: {
        Row: {
          id: number
          name: string
          person: number
        }
        Insert: {
          id?: number
          name: string
          person: number
        }
        Update: {
          id?: number
          name?: string
          person?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_person_also_known_as_person_fkey"
            columns: ["person"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_person_also_known_as_person_fkey"
            columns: ["person"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_person_also_known_as_person_fkey"
            columns: ["person"]
            isOneToOne: false
            referencedRelation: "person_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_person_also_known_as_person_fkey"
            columns: ["person"]
            isOneToOne: false
            referencedRelation: "tmdb_person"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_person_external_id: {
        Row: {
          id: number
          person: number
          source: string
          value: string
        }
        Insert: {
          id?: number
          person: number
          source: string
          value: string
        }
        Update: {
          id?: number
          person?: number
          source?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_person_external_id_person_fkey"
            columns: ["person"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_person_external_id_person_fkey"
            columns: ["person"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_person_external_id_person_fkey"
            columns: ["person"]
            isOneToOne: false
            referencedRelation: "person_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_person_external_id_person_fkey"
            columns: ["person"]
            isOneToOne: false
            referencedRelation: "tmdb_person"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_person_image: {
        Row: {
          aspect_ratio: number | null
          file_path: string
          height: number | null
          id: number
          person: number
          vote_average: number | null
          vote_count: number | null
          width: number | null
        }
        Insert: {
          aspect_ratio?: number | null
          file_path: string
          height?: number | null
          id?: number
          person: number
          vote_average?: number | null
          vote_count?: number | null
          width?: number | null
        }
        Update: {
          aspect_ratio?: number | null
          file_path?: string
          height?: number | null
          id?: number
          person?: number
          vote_average?: number | null
          vote_count?: number | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_person_image_person_fkey"
            columns: ["person"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_person_image_person_fkey"
            columns: ["person"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_person_image_person_fkey"
            columns: ["person"]
            isOneToOne: false
            referencedRelation: "person_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_person_image_person_fkey"
            columns: ["person"]
            isOneToOne: false
            referencedRelation: "tmdb_person"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_person_translation: {
        Row: {
          biography: string | null
          id: number
          iso_3166_1: string | null
          iso_639_1: string | null
          person: number | null
        }
        Insert: {
          biography?: string | null
          id?: number
          iso_3166_1?: string | null
          iso_639_1?: string | null
          person?: number | null
        }
        Update: {
          biography?: string | null
          id?: number
          iso_3166_1?: string | null
          iso_639_1?: string | null
          person?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_person_translation_person_fkey"
            columns: ["person"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_person_translation_person_fkey"
            columns: ["person"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_person_translation_person_fkey"
            columns: ["person"]
            isOneToOne: false
            referencedRelation: "person_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_person_translation_person_fkey"
            columns: ["person"]
            isOneToOne: false
            referencedRelation: "tmdb_person"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_tv_series: {
        Row: {
          adult: boolean
          first_air_date: string | null
          id: number
          in_production: boolean
          last_air_date: string | null
          number_of_episodes: number | null
          number_of_seasons: number | null
          original_language: string | null
          original_name: string | null
          popularity: number
          status: string | null
          type: string | null
          vote_average: number
          vote_count: number
        }
        Insert: {
          adult?: boolean
          first_air_date?: string | null
          id?: number
          in_production?: boolean
          last_air_date?: string | null
          number_of_episodes?: number | null
          number_of_seasons?: number | null
          original_language?: string | null
          original_name?: string | null
          popularity?: number
          status?: string | null
          type?: string | null
          vote_average?: number
          vote_count?: number
        }
        Update: {
          adult?: boolean
          first_air_date?: string | null
          id?: number
          in_production?: boolean
          last_air_date?: string | null
          number_of_episodes?: number | null
          number_of_seasons?: number | null
          original_language?: string | null
          original_name?: string | null
          popularity?: number
          status?: string | null
          type?: string | null
          vote_average?: number
          vote_count?: number
        }
        Relationships: []
      }
      tmdb_tv_series_alternative_titles: {
        Row: {
          id: number
          iso_3166_1: string
          serie_id: number
          title: string
          type: string | null
        }
        Insert: {
          id?: number
          iso_3166_1: string
          serie_id: number
          title: string
          type?: string | null
        }
        Update: {
          id?: number
          iso_3166_1?: string
          serie_id?: number
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_tv_series_alternative_titles_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_alternative_titles_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_tv_series_content_ratings: {
        Row: {
          descriptors: string[] | null
          id: number
          iso_3166_1: string
          rating: string
          serie_id: number
        }
        Insert: {
          descriptors?: string[] | null
          id?: number
          iso_3166_1: string
          rating: string
          serie_id: number
        }
        Update: {
          descriptors?: string[] | null
          id?: number
          iso_3166_1?: string
          rating?: string
          serie_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_tv_series_content_ratings_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_content_ratings_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_tv_series_credits: {
        Row: {
          character: string | null
          department: string
          episode_count: number | null
          id: string
          job: string
          person_id: number
          serie_id: number
        }
        Insert: {
          character?: string | null
          department: string
          episode_count?: number | null
          id: string
          job: string
          person_id: number
          serie_id: number
        }
        Update: {
          character?: string | null
          department?: string
          episode_count?: number | null
          id?: string
          job?: string
          person_id?: number
          serie_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_tv_series_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "tmdb_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_credits_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_credits_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_tv_series_episodes: {
        Row: {
          air_date: string | null
          episode_number: number
          episode_type: string | null
          id: number
          name: string | null
          overview: string | null
          production_code: string | null
          runtime: number | null
          season_id: number
          still_path: string | null
          vote_average: number
          vote_count: number
        }
        Insert: {
          air_date?: string | null
          episode_number: number
          episode_type?: string | null
          id?: number
          name?: string | null
          overview?: string | null
          production_code?: string | null
          runtime?: number | null
          season_id: number
          still_path?: string | null
          vote_average?: number
          vote_count?: number
        }
        Update: {
          air_date?: string | null
          episode_number?: number
          episode_type?: string | null
          id?: number
          name?: string | null
          overview?: string | null
          production_code?: string | null
          runtime?: number | null
          season_id?: number
          still_path?: string | null
          vote_average?: number
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_tv_series_episodes_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series_seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_episodes_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "tv_season"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_tv_series_episodes_credits: {
        Row: {
          credit_id: string
          episode_id: number
          id: number
        }
        Insert: {
          credit_id: string
          episode_id: number
          id?: number
        }
        Update: {
          credit_id?: string
          episode_id?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_tv_series_episodes_credits_credit_id_fkey"
            columns: ["credit_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series_credits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_episodes_credits_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series_episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_tv_series_external_ids: {
        Row: {
          id: number
          serie_id: number
          source: string
          value: string
        }
        Insert: {
          id?: number
          serie_id: number
          source: string
          value: string
        }
        Update: {
          id?: number
          serie_id?: number
          source?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_tv_series_external_ids_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_external_ids_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_tv_series_genres: {
        Row: {
          genre_id: number
          id: number
          serie_id: number
        }
        Insert: {
          genre_id: number
          id?: number
          serie_id: number
        }
        Update: {
          genre_id?: number
          id?: number
          serie_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_tv_series_genres_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "tmdb_genre"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_genres_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_genres_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_tv_series_images: {
        Row: {
          aspect_ratio: number
          file_path: string
          height: number
          id: number
          iso_639_1: string | null
          serie_id: number
          type: Database["public"]["Enums"]["image_type"]
          vote_average: number
          vote_count: number
          width: number
        }
        Insert: {
          aspect_ratio?: number
          file_path: string
          height?: number
          id?: number
          iso_639_1?: string | null
          serie_id: number
          type: Database["public"]["Enums"]["image_type"]
          vote_average?: number
          vote_count?: number
          width?: number
        }
        Update: {
          aspect_ratio?: number
          file_path?: string
          height?: number
          id?: number
          iso_639_1?: string | null
          serie_id?: number
          type?: Database["public"]["Enums"]["image_type"]
          vote_average?: number
          vote_count?: number
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_tv_series_images_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_images_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_tv_series_keywords: {
        Row: {
          id: number
          keyword_id: number
          serie_id: number
        }
        Insert: {
          id?: number
          keyword_id: number
          serie_id: number
        }
        Update: {
          id?: number
          keyword_id?: number
          serie_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_tv_series_keywords_keyword_id_fkey"
            columns: ["keyword_id"]
            isOneToOne: false
            referencedRelation: "tmdb_keyword"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_keywords_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_keywords_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_tv_series_languages: {
        Row: {
          id: number
          iso_639_1: string
          serie_id: number
        }
        Insert: {
          id?: number
          iso_639_1: string
          serie_id: number
        }
        Update: {
          id?: number
          iso_639_1?: string
          serie_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_tv_series_languages_iso_639_1_fkey"
            columns: ["iso_639_1"]
            isOneToOne: false
            referencedRelation: "tmdb_language"
            referencedColumns: ["iso_639_1"]
          },
          {
            foreignKeyName: "tmdb_tv_series_languages_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_languages_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_tv_series_networks: {
        Row: {
          id: number
          network_id: number
          serie_id: number
        }
        Insert: {
          id?: number
          network_id: number
          serie_id: number
        }
        Update: {
          id?: number
          network_id?: number
          serie_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_tv_series_networks_network_id_fkey"
            columns: ["network_id"]
            isOneToOne: false
            referencedRelation: "tmdb_network"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_networks_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_networks_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_tv_series_origin_country: {
        Row: {
          id: number
          iso_3166_1: string
          serie_id: number
        }
        Insert: {
          id?: number
          iso_3166_1: string
          serie_id: number
        }
        Update: {
          id?: number
          iso_3166_1?: string
          serie_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_tv_series_origin_country_iso_3166_1_fkey"
            columns: ["iso_3166_1"]
            isOneToOne: false
            referencedRelation: "tmdb_country"
            referencedColumns: ["iso_3166_1"]
          },
          {
            foreignKeyName: "tmdb_tv_series_origin_country_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_origin_country_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_tv_series_production_companies: {
        Row: {
          company_id: number
          id: number
          serie_id: number
        }
        Insert: {
          company_id: number
          id?: number
          serie_id: number
        }
        Update: {
          company_id?: number
          id?: number
          serie_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_tv_series_production_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_production_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "tmdb_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_production_companies_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_production_companies_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_tv_series_production_countries: {
        Row: {
          id: number
          iso_3166_1: string
          serie_id: number
        }
        Insert: {
          id?: number
          iso_3166_1: string
          serie_id: number
        }
        Update: {
          id?: number
          iso_3166_1?: string
          serie_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_tv_series_production_countries_iso_3166_1_fkey"
            columns: ["iso_3166_1"]
            isOneToOne: false
            referencedRelation: "tmdb_country"
            referencedColumns: ["iso_3166_1"]
          },
          {
            foreignKeyName: "tmdb_tv_series_production_countries_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_production_countries_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_tv_series_seasons: {
        Row: {
          id: number
          poster_path: string | null
          season_number: number
          serie_id: number
          vote_average: number
          vote_count: number
        }
        Insert: {
          id?: number
          poster_path?: string | null
          season_number: number
          serie_id: number
          vote_average: number
          vote_count: number
        }
        Update: {
          id?: number
          poster_path?: string | null
          season_number?: number
          serie_id?: number
          vote_average?: number
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_tv_series_seasons_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_seasons_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_tv_series_seasons_credits: {
        Row: {
          credit_id: string
          id: number
          order: number | null
          season_id: number
        }
        Insert: {
          credit_id: string
          id?: number
          order?: number | null
          season_id: number
        }
        Update: {
          credit_id?: string
          id?: number
          order?: number | null
          season_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_tv_series_seasons_credits_credit_id_fkey"
            columns: ["credit_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series_credits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_seasons_credits_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series_seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_seasons_credits_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "tv_season"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_tv_series_seasons_translations: {
        Row: {
          id: number
          iso_3166_1: string
          iso_639_1: string
          name: string | null
          overview: string | null
          season_id: number
        }
        Insert: {
          id?: number
          iso_3166_1: string
          iso_639_1: string
          name?: string | null
          overview?: string | null
          season_id: number
        }
        Update: {
          id?: number
          iso_3166_1?: string
          iso_639_1?: string
          name?: string | null
          overview?: string | null
          season_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_tv_series_seasons_translations_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series_seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_seasons_translations_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "tv_season"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_tv_series_spoken_languages: {
        Row: {
          id: number
          iso_639_1: string
          serie_id: number
        }
        Insert: {
          id?: number
          iso_639_1: string
          serie_id: number
        }
        Update: {
          id?: number
          iso_639_1?: string
          serie_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_tv_series_spoken_languages_iso_639_1_fkey"
            columns: ["iso_639_1"]
            isOneToOne: false
            referencedRelation: "tmdb_language"
            referencedColumns: ["iso_639_1"]
          },
          {
            foreignKeyName: "tmdb_tv_series_spoken_languages_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_spoken_languages_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_tv_series_translations: {
        Row: {
          homepage: string | null
          id: number
          iso_3166_1: string
          iso_639_1: string
          name: string | null
          overview: string | null
          serie_id: number
          tagline: string | null
        }
        Insert: {
          homepage?: string | null
          id?: number
          iso_3166_1: string
          iso_639_1: string
          name?: string | null
          overview?: string | null
          serie_id: number
          tagline?: string | null
        }
        Update: {
          homepage?: string | null
          id?: number
          iso_3166_1?: string
          iso_639_1?: string
          name?: string | null
          overview?: string | null
          serie_id?: number
          tagline?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_tv_serie_translations_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_serie_translations_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_tv_series_videos: {
        Row: {
          id: string
          iso_3166_1: string | null
          iso_639_1: string | null
          key: string
          name: string | null
          official: boolean
          published_at: string
          serie_id: number
          site: string
          size: number | null
          type: string | null
        }
        Insert: {
          id: string
          iso_3166_1?: string | null
          iso_639_1?: string | null
          key: string
          name?: string | null
          official?: boolean
          published_at: string
          serie_id: number
          site: string
          size?: number | null
          type?: string | null
        }
        Update: {
          id?: string
          iso_3166_1?: string | null
          iso_639_1?: string | null
          key?: string
          name?: string | null
          official?: boolean
          published_at?: string
          serie_id?: number
          site?: string
          size?: number | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_tv_series_videos_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_videos_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          avatar_url: string | null
          background_url: string | null
          bio: string | null
          created_at: string
          favorite_color: string | null
          followers_count: number
          following_count: number
          full_name: string
          id: string
          language: string
          premium: boolean
          private: boolean
          username: string
          username_updated_at: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          background_url?: string | null
          bio?: string | null
          created_at?: string
          favorite_color?: string | null
          followers_count?: number
          following_count?: number
          full_name: string
          id: string
          language?: string
          premium?: boolean
          private?: boolean
          username: string
          username_updated_at?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          background_url?: string | null
          bio?: string | null
          created_at?: string
          favorite_color?: string | null
          followers_count?: number
          following_count?: number
          full_name?: string
          id?: string
          language?: string
          premium?: boolean
          private?: boolean
          username?: string
          username_updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          created_at: string
          id: number
          is_liked: boolean
          media_id: number
          rating: number | null
          updated_at: string | null
          user_id: string
          watched_date: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_liked?: boolean
          media_id: number
          rating?: number | null
          updated_at?: string | null
          user_id: string
          watched_date?: string
        }
        Update: {
          created_at?: string
          id?: number
          is_liked?: boolean
          media_id?: number
          rating?: number | null
          updated_at?: string | null
          user_id?: string
          watched_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_activity_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_activity_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_activity_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_activity_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_billing: {
        Row: {
          billing_address: Json | null
          payment_method: Json | null
          user_id: string
        }
        Insert: {
          billing_address?: Json | null
          payment_method?: Json | null
          user_id: string
        }
        Update: {
          billing_address?: Json | null
          payment_method?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_billing_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_billing_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follower: {
        Row: {
          created_at: string
          followee_id: string
          id: number
          is_pending: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          followee_id: string
          id?: number
          is_pending?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          followee_id?: string
          id?: number
          is_pending?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follower_followee_id_fkey"
            columns: ["followee_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follower_followee_id_fkey"
            columns: ["followee_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follower_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follower_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_friend: {
        Row: {
          created_at: string
          friend_id: string
          id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: number
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_friend_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_friend_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_friend_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_friend_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_tokens: {
        Row: {
          created_at: string
          device_type: Database["public"]["Enums"]["notifications_device_type"]
          expires_at: string | null
          id: number
          provider: Database["public"]["Enums"]["notifications_provider"]
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_type: Database["public"]["Enums"]["notifications_device_type"]
          expires_at?: string | null
          id?: number
          provider: Database["public"]["Enums"]["notifications_provider"]
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_type?: Database["public"]["Enums"]["notifications_device_type"]
          expires_at?: string | null
          id?: number
          provider?: Database["public"]["Enums"]["notifications_provider"]
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notification_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_notification_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_person_follower: {
        Row: {
          created_at: string
          id: number
          person_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          person_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          person_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_person_follower_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_person_follower_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_person_follower_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_person_follower_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "tmdb_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_person_follower_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_person_follower_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_recos: {
        Row: {
          comment: string | null
          created_at: string
          id: number
          media_id: number
          sender_id: string
          status: Database["public"]["Enums"]["reco_status"]
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: number
          media_id: number
          sender_id: string
          status?: Database["public"]["Enums"]["reco_status"]
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: number
          media_id?: number
          sender_id?: string
          status?: Database["public"]["Enums"]["reco_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_recos_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_recos_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_recos_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_recos_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_recos_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_recos_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_recos_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_recos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_recos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_review: {
        Row: {
          body: Json
          comments_count: number
          created_at: string
          id: number
          likes_count: number
          title: string | null
          updated_at: string | null
          views_count: number
        }
        Insert: {
          body: Json
          comments_count?: number
          created_at?: string
          id?: number
          likes_count?: number
          title?: string | null
          updated_at?: string | null
          views_count?: number
        }
        Update: {
          body?: Json
          comments_count?: number
          created_at?: string
          id?: number
          likes_count?: number
          title?: string | null
          updated_at?: string | null
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_review_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_review_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_review_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_followers_rating"
            referencedColumns: ["id"]
          },
        ]
      }
      user_review_like: {
        Row: {
          created_at: string
          id: number
          review_id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          review_id: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          review_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_review_like_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "user_review"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_review_like_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_review_like_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: string
          metadata: Json | null
          price_id: string | null
          quantity: number | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          trial_end: string | null
          trial_start: string | null
          user_id: string
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id: string
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "prices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_watchlist: {
        Row: {
          comment: string | null
          created_at: string
          id: number
          media_id: number
          status: Database["public"]["Enums"]["watchlist_status"]
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: number
          media_id: number
          status?: Database["public"]["Enums"]["watchlist_status"]
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: number
          media_id?: number
          status?: Database["public"]["Enums"]["watchlist_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_watchlist_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_watchlist_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_watchlist_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_watchlist_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_watchlist_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_watchlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_watchlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      collection: {
        Row: {
          backdrop_path: string | null
          homepage: string | null
          id: number | null
          name: string | null
          overview: string | null
          poster_path: string | null
        }
        Relationships: []
      }
      company: {
        Row: {
          alternative_names: Json | null
          description: string | null
          headquarters: string | null
          homepage: string | null
          id: number | null
          logo_path: string | null
          name: string | null
          origin_country: string | null
          parent_company: Json | null
        }
        Relationships: []
      }
      media: {
        Row: {
          avatar_path: string | null
          avatar_url: string | null
          backdrop_path: string | null
          backdrop_url: string | null
          date: string | null
          extra_data: Json | null
          follower_avg_rating: number | null
          genres: Json[] | null
          id: number | null
          likes_count: number | null
          main_credit: Json[] | null
          media_id: number | null
          media_type: Database["public"]["Enums"]["media_type"] | null
          popularity: number | null
          recos_count: number | null
          review_count: number | null
          slug: string | null
          title: string | null
          tmdb_popularity: number | null
          tmdb_vote_average: number | null
          tmdb_vote_count: number | null
          url: string | null
          vote_average: number | null
          vote_count: number | null
          watch_count: number | null
          watchlist_count: number | null
        }
        Relationships: []
      }
      media_movie: {
        Row: {
          avatar_path: string | null
          avatar_url: string | null
          backdrop_path: string | null
          backdrop_url: string | null
          date: string | null
          extra_data: Json | null
          follower_avg_rating: number | null
          genres: Json[] | null
          id: number | null
          likes_count: number | null
          main_credit: Json[] | null
          media_id: number | null
          media_type: Database["public"]["Enums"]["media_type"] | null
          popularity: number | null
          recos_count: number | null
          review_count: number | null
          slug: string | null
          title: string | null
          tmdb_popularity: number | null
          tmdb_vote_average: number | null
          tmdb_vote_count: number | null
          url: string | null
          vote_average: number | null
          vote_count: number | null
          watch_count: number | null
          watchlist_count: number | null
        }
        Relationships: []
      }
      media_movie_aggregate_credits: {
        Row: {
          credits: Json | null
          media: Json | null
          movie_id: number | null
          person_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_movie_credits_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "tmdb_person"
            referencedColumns: ["id"]
          },
        ]
      }
      media_person: {
        Row: {
          avatar_path: string | null
          avatar_url: string | null
          backdrop_path: string | null
          backdrop_url: string | null
          date: string | null
          extra_data: Json | null
          follower_avg_rating: number | null
          genres: Json[] | null
          id: number | null
          likes_count: number | null
          main_credit: Json[] | null
          media_id: number | null
          media_type: Database["public"]["Enums"]["media_type"] | null
          popularity: number | null
          recos_count: number | null
          review_count: number | null
          slug: string | null
          title: string | null
          tmdb_popularity: number | null
          tmdb_vote_average: number | null
          tmdb_vote_count: number | null
          url: string | null
          vote_average: number | null
          vote_count: number | null
          watch_count: number | null
          watchlist_count: number | null
        }
        Relationships: []
      }
      media_tv_series: {
        Row: {
          avatar_path: string | null
          avatar_url: string | null
          backdrop_path: string | null
          backdrop_url: string | null
          date: string | null
          extra_data: Json | null
          follower_avg_rating: number | null
          genres: Json[] | null
          id: number | null
          likes_count: number | null
          main_credit: Json[] | null
          media_id: number | null
          media_type: Database["public"]["Enums"]["media_type"] | null
          popularity: number | null
          recos_count: number | null
          review_count: number | null
          slug: string | null
          title: string | null
          tmdb_popularity: number | null
          tmdb_vote_average: number | null
          tmdb_vote_count: number | null
          url: string | null
          vote_average: number | null
          vote_count: number | null
          watch_count: number | null
          watchlist_count: number | null
        }
        Relationships: []
      }
      person: {
        Row: {
          gender: number | null
          id: number | null
          known_for_department: string | null
          name: string | null
          popularity: number | null
          profile_path: string | null
          slug: string | null
        }
        Insert: {
          gender?: number | null
          id?: number | null
          known_for_department?: string | null
          name?: string | null
          popularity?: number | null
          profile_path?: never
          slug?: never
        }
        Update: {
          gender?: number | null
          id?: number | null
          known_for_department?: string | null
          name?: string | null
          popularity?: number | null
          profile_path?: never
          slug?: never
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_person_gender_fkey"
            columns: ["gender"]
            isOneToOne: false
            referencedRelation: "tmdb_gender"
            referencedColumns: ["id"]
          },
        ]
      }
      person_full: {
        Row: {
          adult: boolean | null
          also_known_as: Json | null
          backdrop_path: string | null
          biography: string | null
          birthday: string | null
          deathday: string | null
          departments: string[] | null
          gender: number | null
          homepage: string | null
          id: number | null
          imdb_id: string | null
          known_for_department: string | null
          name: string | null
          place_of_birth: string | null
          popularity: number | null
          profile_path: string | null
          slug: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_person_gender_fkey"
            columns: ["gender"]
            isOneToOne: false
            referencedRelation: "tmdb_gender"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists_friends: {
        Row: {
          created_at: string | null
          description: string | null
          id: number | null
          items_count: number | null
          likes_count: number | null
          poster_url: string | null
          private: boolean | null
          saved_count: number | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "playlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          avatar_url: string | null
          background_url: string | null
          bio: string | null
          favorite_color: string | null
          followers_count: number | null
          following_count: number | null
          full_name: string | null
          id: string | null
          premium: boolean | null
          private: boolean | null
          username: string | null
          visible: boolean | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          background_url?: string | null
          bio?: string | null
          favorite_color?: string | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          id?: string | null
          premium?: boolean | null
          private?: boolean | null
          username?: string | null
          visible?: never
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          background_url?: string | null
          bio?: string | null
          favorite_color?: string | null
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          id?: string | null
          premium?: boolean | null
          private?: boolean | null
          username?: string | null
          visible?: never
          website?: string | null
        }
        Relationships: []
      }
      tmdb_combined_credits: {
        Row: {
          department: string | null
          job: string | null
          media_id: number | null
          media_type: Database["public"]["Enums"]["media_type"] | null
          person_id: number | null
        }
        Relationships: []
      }
      tmdb_movie_credits_random: {
        Row: {
          department: string | null
          id: string | null
          job: string | null
          movie_id: number | null
          person_id: number | null
        }
        Insert: {
          department?: string | null
          id?: string | null
          job?: string | null
          movie_id?: number | null
          person_id?: number | null
        }
        Update: {
          department?: string | null
          id?: string | null
          job?: string | null
          movie_id?: number | null
          person_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_movie_credits_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "tmdb_person"
            referencedColumns: ["id"]
          },
        ]
      }
      tmdb_person_department: {
        Row: {
          department: string | null
          person_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_movie_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "tmdb_person"
            referencedColumns: ["id"]
          },
        ]
      }
      tv_season: {
        Row: {
          id: number | null
          name: string | null
          overview: string | null
          poster_path: string | null
          season_number: number | null
          serie_id: number | null
          vote_average: number | null
          vote_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_tv_series_seasons_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_tv_series_seasons_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_tv_series"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feed: {
        Row: {
          created_at: string | null
          id: number | null
          is_liked: boolean | null
          media_id: number | null
          rating: number | null
          updated_at: string | null
          user_id: string | null
          watched_date: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number | null
          is_liked?: boolean | null
          media_id?: number | null
          rating?: number | null
          updated_at?: string | null
          user_id?: string | null
          watched_date?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number | null
          is_liked?: boolean | null
          media_id?: number | null
          rating?: number | null
          updated_at?: string | null
          user_id?: string | null
          watched_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_activity_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_activity_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_activity_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_activity_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feed_cast_crew: {
        Row: {
          date: string | null
          jobs: string[] | null
          movie_id: number | null
          person_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tmdb_movie_credits_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "tmdb_movie"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tmdb_movie_credits_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "tmdb_person"
            referencedColumns: ["id"]
          },
        ]
      }
      user_followers_average_rating: {
        Row: {
          follower_avg_rating: number | null
          media_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_activity_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_activity_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_activity_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_activity_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
        ]
      }
      user_followers_rating: {
        Row: {
          created_at: string | null
          id: number | null
          is_liked: boolean | null
          media_id: number | null
          rating: number | null
          updated_at: string | null
          user_id: string | null
          watched_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_activity_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_activity_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_activity_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_activity_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_recos_aggregated: {
        Row: {
          created_at: string | null
          media_id: number | null
          senders: Json[] | null
          status: Database["public"]["Enums"]["reco_status"] | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_recos_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_recos_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_recos_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_recos_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_recos_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_recos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_recos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_recos_aggregated_random: {
        Row: {
          created_at: string | null
          media_id: number | null
          senders: Json[] | null
          status: Database["public"]["Enums"]["reco_status"] | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_recos_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_recos_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_recos_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_recos_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_recos_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_recos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_recos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user_watchlist_random: {
        Row: {
          comment: string | null
          created_at: string | null
          id: number | null
          media_id: number | null
          status: Database["public"]["Enums"]["watchlist_status"] | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: number | null
          media_id?: number | null
          status?: Database["public"]["Enums"]["watchlist_status"] | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: number | null
          media_id?: number | null
          status?: Database["public"]["Enums"]["watchlist_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_watchlist_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_watchlist_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_watchlist_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_watchlist_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_watchlist_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_watchlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_watchlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      widget_most_recommended: {
        Row: {
          media_id: number | null
          recommendation_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_recos_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_recos_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_movie"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_recos_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_person"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_recos_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media_tv_series"
            referencedColumns: ["media_id"]
          },
          {
            foreignKeyName: "user_recos_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "medias"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      delete_avatar: {
        Args: {
          avatar_url: string
        }
        Returns: Record<string, unknown>
      }
      delete_playlist_poster: {
        Args: {
          poster_url: string
        }
        Returns: Record<string, unknown>
      }
      delete_storage_object: {
        Args: {
          bucket: string
          object: string
        }
        Returns: Record<string, unknown>
      }
      find_media: {
        Args: {
          p_media_id: number
          p_media_type: Database["public"]["Enums"]["media_type"]
        }
        Returns: Json
      }
      get_config: {
        Args: {
          user_id?: string
        }
        Returns: {
          maintenance_mode: boolean
          user_language: string
          user_premium: boolean
        }[]
      }
      importer_best_match_movie: {
        Args: {
          lang: string
          search_title: string
          search_year?: number
          similarity_threshold?: number
        }
        Returns: {
          id: number
          title: string
          release_date: string
          language: string
          popularity: number
          directors: Json
        }[]
      }
      search_movies: {
        Args: {
          search_query: string
          lang: string
          page_number?: number
          page_size?: number
          similarity_threshold?: number
        }
        Returns: {
          id: number
          adult: boolean
          backdrop_path: string
          budget: number
          homepage: string
          imdb_id: string
          original_language: string
          original_title: string
          popularity: number
          release_date: string
          revenue: number
          runtime: number
          status: string
          vote_average: number
          vote_count: number
          collection_id: number
          language: Database["public"]["Enums"]["language_app"]
          overview: string
          poster_path: string
          tagline: string
          title: string
          follower_avg_rating: number
          directors: Json[]
          genres: Json[]
        }[]
      }
      slugify: {
        Args: {
          value: string
        }
        Returns: string
      }
      user_movie_guidelist_insert: {
        Args: {
          movieid: number
          comment: string
          sender_user_id: string
          receiver_user_ids: string[]
        }
        Returns: undefined
      }
      user_recos_insert: {
        Args: {
          mediaid: number
          comment: string
          sender_user_id: string
          receiver_user_ids: string[]
        }
        Returns: undefined
      }
      utils_calculate_vote_average: {
        Args: {
          media_id: number
        }
        Returns: number
      }
      utils_check_playlist_guest: {
        Args: {
          p_user_id: string
          p_playlist_id: number
        }
        Returns: boolean
      }
      utils_check_playlist_owner: {
        Args: {
          p_user_id: string
          p_playlist_id: number
        }
        Returns: boolean
      }
      utils_check_playlist_privacy: {
        Args: {
          p_playlist_id: number
        }
        Returns: boolean
      }
      utils_check_user_following: {
        Args: {
          p_follower_id: string
          p_followee_id: string
        }
        Returns: boolean
      }
      utils_check_user_friendship: {
        Args: {
          user_id_1: string
          user_id_2: string
        }
        Returns: boolean
      }
      utils_check_user_privacy: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      utils_generate_username: {
        Args: {
          user_details: unknown
        }
        Returns: string
      }
    }
    Enums: {
      eventType: "INSERT" | "DELETE" | "UPDATE"
      guidelist_status: "active" | "completed" | "deleted"
      image_type: "backdrop" | "poster" | "logo" | "profile"
      language_app: "en-US" | "fr-FR"
      media_type: "movie" | "tv_series" | "person" | "tv_season" | "tv_episode"
      notifications_device_type: "web" | "ios" | "android"
      notifications_provider: "fcm"
      pricing_plan_interval: "day" | "week" | "month" | "year"
      pricing_type: "one_time" | "recurring"
      reco_status: "active" | "completed" | "deleted"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
      sync_logs_status:
        | "initialized"
        | "fetching_data"
        | "data_fetched"
        | "syncing_to_db"
        | "success"
        | "failed"
      sync_logs_type:
        | "tmdb_movie"
        | "tmdb_person"
        | "tmdb_collection"
        | "tmdb_keyword"
        | "tmdb_company"
        | "tmdb_language"
        | "tmdb_country"
        | "tmdb_genre"
        | "tmdb_network"
        | "tmdb_tv_serie"
      watchlist_status: "active" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

