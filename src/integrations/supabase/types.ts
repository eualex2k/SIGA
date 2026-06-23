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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      associate_documents: {
        Row: {
          associate_id: string
          created_at: string
          file_path: string
          id: string
          name: string
        }
        Insert: {
          associate_id: string
          created_at?: string
          file_path: string
          id?: string
          name: string
        }
        Update: {
          associate_id?: string
          created_at?: string
          file_path?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "associate_documents_associate_id_fkey"
            columns: ["associate_id"]
            isOneToOne: false
            referencedRelation: "associates"
            referencedColumns: ["id"]
          },
        ]
      }
      associates: {
        Row: {
          address: string | null
          birth_date: string | null
          city: string | null
          competencies: string | null
          cpf: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          join_date: string
          monthly_fee: number
          notes: string | null
          phone: string | null
          photo_url: string | null
          rg: string | null
          state: string | null
          status: Database["public"]["Enums"]["associate_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          competencies?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          join_date?: string
          monthly_fee?: number
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          rg?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["associate_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          competencies?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          join_date?: string
          monthly_fee?: number
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          rg?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["associate_status"]
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      finance_categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: []
      }
      finance_transactions: {
        Row: {
          amount: number
          associate_id: string | null
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string
          fee_id: string | null
          id: string
          payment_method: string | null
          receipt_path: string | null
          reference: string | null
          transaction_date: string
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          amount: number
          associate_id?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          fee_id?: string | null
          id?: string
          payment_method?: string | null
          receipt_path?: string | null
          reference?: string | null
          transaction_date?: string
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          amount?: number
          associate_id?: string | null
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          fee_id?: string | null
          id?: string
          payment_method?: string | null
          receipt_path?: string | null
          reference?: string | null
          transaction_date?: string
          type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "finance_transactions_associate_id_fkey"
            columns: ["associate_id"]
            isOneToOne: false
            referencedRelation: "associates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_fee_id_fkey"
            columns: ["fee_id"]
            isOneToOne: false
            referencedRelation: "monthly_fees"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string | null
          created_at: string
          id: string
          location: string | null
          min_quantity: number
          name: string
          notes: string | null
          quantity: number
          unit: string | null
          unit_cost: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          location?: string | null
          min_quantity?: number
          name: string
          notes?: string | null
          quantity?: number
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          location?: string | null
          min_quantity?: number
          name?: string
          notes?: string | null
          quantity?: number
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          item_id: string
          quantity: number
          reason: string | null
          type: Database["public"]["Enums"]["movement_type"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          item_id: string
          quantity: number
          reason?: string | null
          type: Database["public"]["Enums"]["movement_type"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          item_id?: string
          quantity?: number
          reason?: string | null
          type?: Database["public"]["Enums"]["movement_type"]
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_fees: {
        Row: {
          amount: number
          associate_id: string
          created_at: string
          due_date: string
          id: string
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          reference_month: string
          status: Database["public"]["Enums"]["fee_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          associate_id: string
          created_at?: string
          due_date: string
          id?: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          reference_month: string
          status?: Database["public"]["Enums"]["fee_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          associate_id?: string
          created_at?: string
          due_date?: string
          id?: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          reference_month?: string
          status?: Database["public"]["Enums"]["fee_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_fees_associate_id_fkey"
            columns: ["associate_id"]
            isOneToOne: false
            referencedRelation: "associates"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      shifts: {
        Row: {
          created_at: string
          end_time: string
          hours: number | null
          id: string
          location: string | null
          notes: string | null
          shift_date: string
          staff_id: string
          start_time: string
          status: Database["public"]["Enums"]["shift_status"]
        }
        Insert: {
          created_at?: string
          end_time: string
          hours?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          shift_date: string
          staff_id: string
          start_time: string
          status?: Database["public"]["Enums"]["shift_status"]
        }
        Update: {
          created_at?: string
          end_time?: string
          hours?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          shift_date?: string
          staff_id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["shift_status"]
        }
        Relationships: [
          {
            foreignKeyName: "shifts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          active: boolean
          cpf: string | null
          created_at: string
          email: string | null
          full_name: string
          hire_date: string
          hourly_rate: number
          id: string
          notes: string | null
          phone: string | null
          role_title: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          hire_date?: string
          hourly_rate?: number
          id?: string
          notes?: string | null
          phone?: string | null
          role_title?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          hire_date?: string
          hourly_rate?: number
          id?: string
          notes?: string | null
          phone?: string | null
          role_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      staff_payments: {
        Row: {
          amount: number
          created_at: string
          hours_worked: number | null
          id: string
          notes: string | null
          paid_date: string | null
          reference_month: string
          staff_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          hours_worked?: number | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          reference_month: string
          staff_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          hours_worked?: number | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          reference_month?: string
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_payments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "member"
      associate_status: "active" | "inactive" | "suspended"
      fee_status: "pending" | "paid" | "overdue" | "cancelled"
      movement_type: "in" | "out"
      shift_status: "scheduled" | "completed" | "missed" | "cancelled"
      transaction_type: "income" | "expense"
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
    Enums: {
      app_role: ["admin", "manager", "member"],
      associate_status: ["active", "inactive", "suspended"],
      fee_status: ["pending", "paid", "overdue", "cancelled"],
      movement_type: ["in", "out"],
      shift_status: ["scheduled", "completed", "missed", "cancelled"],
      transaction_type: ["income", "expense"],
    },
  },
} as const
