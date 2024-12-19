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
      bills: {
        Row: {
          amount: number
          created_at: string
          id: number
          payment_due_date: string
          selected_profiles: string[] | null
          split_between: number
          status: string
          title: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: number
          payment_due_date: string
          selected_profiles?: string[] | null
          split_between?: number
          status: string
          title: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: number
          payment_due_date?: string
          selected_profiles?: string[] | null
          split_between?: number
          status?: string
          title?: string
        }
        Relationships: []
      }
      group_profiles: {
        Row: {
          created_at: string
          group_id: number
          profile_id: number
        }
        Insert: {
          created_at?: string
          group_id: number
          profile_id: number
        }
        Update: {
          created_at?: string
          group_id?: number
          profile_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "group_profiles_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_tasks: {
        Row: {
          comment: string | null
          completed: boolean | null
          created_at: string
          description: string
          group_id: number | null
          id: number
        }
        Insert: {
          comment?: string | null
          completed?: boolean | null
          created_at?: string
          description: string
          group_id?: number | null
          id?: number
        }
        Update: {
          comment?: string | null
          completed?: boolean | null
          created_at?: string
          description?: string
          group_id?: number | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "group_tasks_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: number
          message: string
          profile_id: number | null
          read: boolean | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: number
          message: string
          profile_id?: number | null
          read?: boolean | null
          title: string
        }
        Update: {
          created_at?: string
          id?: number
          message?: string
          profile_id?: number | null
          read?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          icon: string
          id: number
          name: string
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          icon: string
          id?: never
          name: string
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          icon?: string
          id?: never
          name?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      recurring_tasks: {
        Row: {
          assignees: string[] | null
          created_at: string
          icon: string
          id: number
          recurrence_type: string
          selected_days: string[] | null
          specific_day: string | null
          time: string | null
          title: string
        }
        Insert: {
          assignees?: string[] | null
          created_at?: string
          icon: string
          id?: number
          recurrence_type: string
          selected_days?: string[] | null
          specific_day?: string | null
          time?: string | null
          title: string
        }
        Update: {
          assignees?: string[] | null
          created_at?: string
          icon?: string
          id?: number
          recurrence_type?: string
          selected_days?: string[] | null
          specific_day?: string | null
          time?: string | null
          title?: string
        }
        Relationships: []
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
