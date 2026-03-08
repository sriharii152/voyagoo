export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      budget_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          expense_date: string
          id: string
          trip_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          trip_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          trip_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_expenses_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "saved_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      connect_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connect_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "connect_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      connect_groups: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          group_type: string
          id: string
          invite_code: string | null
          name: string
          trip_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          group_type?: string
          id?: string
          invite_code?: string | null
          name: string
          trip_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          group_type?: string
          id?: string
          invite_code?: string | null
          name?: string
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connect_groups_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "saved_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      connect_locations: {
        Row: {
          group_id: string
          id: string
          is_sharing: boolean
          latitude: number
          longitude: number
          updated_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          is_sharing?: boolean
          latitude: number
          longitude: number
          updated_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          is_sharing?: boolean
          latitude?: number
          longitude?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connect_locations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "connect_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      connect_messages: {
        Row: {
          content: string | null
          created_at: string
          file_path: string | null
          group_id: string
          id: string
          message_type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_path?: string | null
          group_id: string
          id?: string
          message_type?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          file_path?: string | null
          group_id?: string
          id?: string
          message_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connect_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "connect_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      diary_comments: {
        Row: {
          content: string
          created_at: string
          entry_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          entry_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          entry_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diary_comments_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "diary_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      diary_entries: {
        Row: {
          created_at: string
          destination: string
          entry_date: string
          foods: string | null
          id: string
          is_public: boolean
          notes: string | null
          places: string | null
          title: string
          updated_at: string
          user_id: string
          views_description: string | null
        }
        Insert: {
          created_at?: string
          destination?: string
          entry_date?: string
          foods?: string | null
          id?: string
          is_public?: boolean
          notes?: string | null
          places?: string | null
          title: string
          updated_at?: string
          user_id: string
          views_description?: string | null
        }
        Update: {
          created_at?: string
          destination?: string
          entry_date?: string
          foods?: string | null
          id?: string
          is_public?: boolean
          notes?: string | null
          places?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          views_description?: string | null
        }
        Relationships: []
      }
      diary_likes: {
        Row: {
          created_at: string
          entry_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diary_likes_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "diary_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      diary_media: {
        Row: {
          caption: string | null
          created_at: string
          entry_id: string
          file_path: string
          file_type: string
          id: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          entry_id: string
          file_path: string
          file_type?: string
          id?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          entry_id?: string
          file_path?: string
          file_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diary_media_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "diary_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_destinations: {
        Row: {
          created_at: string
          destination_category: string
          destination_country: string
          destination_name: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination_category?: string
          destination_country: string
          destination_name: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination_category?: string
          destination_country?: string
          destination_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          travel_preferences: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          travel_preferences?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          travel_preferences?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_activities: {
        Row: {
          activity_name: string
          activity_type: string
          created_at: string
          description: string
          destination: string
          duration: string
          estimated_cost: number | null
          id: string
          user_id: string
        }
        Insert: {
          activity_name: string
          activity_type?: string
          created_at?: string
          description?: string
          destination?: string
          duration?: string
          estimated_cost?: number | null
          id?: string
          user_id: string
        }
        Update: {
          activity_name?: string
          activity_type?: string
          created_at?: string
          description?: string
          destination?: string
          duration?: string
          estimated_cost?: number | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_events: {
        Row: {
          created_at: string
          event_category: string
          event_date: string
          event_location: string
          event_price: string
          event_time: string
          event_title: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_category?: string
          event_date?: string
          event_location?: string
          event_price?: string
          event_time?: string
          event_title: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_category?: string
          event_date?: string
          event_location?: string
          event_price?: string
          event_time?: string
          event_title?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_trips: {
        Row: {
          budget: number | null
          category: string
          created_at: string
          destination: string
          end_date: string | null
          id: string
          notes: string | null
          start_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number | null
          category?: string
          created_at?: string
          destination: string
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number | null
          category?: string
          created_at?: string
          destination?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trip_itinerary_items: {
        Row: {
          activity: string
          created_at: string
          day_number: number
          id: string
          location: string
          sort_order: number
          time: string
          trip_id: string | null
          user_id: string
        }
        Insert: {
          activity: string
          created_at?: string
          day_number?: number
          id?: string
          location?: string
          sort_order?: number
          time?: string
          trip_id?: string | null
          user_id: string
        }
        Update: {
          activity?: string
          created_at?: string
          day_number?: number
          id?: string
          location?: string
          sort_order?: number
          time?: string
          trip_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_itinerary_items_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "saved_trips"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
