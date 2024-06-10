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
            Bill: {
                Row: {
                    amount: number
                    created_at: string
                    id: string
                    name: string
                    paidBy: string
                    tripId: string
                }
                Insert: {
                    amount: number
                    created_at?: string
                    id?: string
                    name: string
                    paidBy?: string
                    tripId: string
                }
                Update: {
                    amount?: number
                    created_at?: string
                    id?: string
                    name?: string
                    paidBy?: string
                    tripId?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "Bill_paidBy_fkey"
                        columns: ["paidBy"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "Bill_paidBy_fkey1"
                        columns: ["paidBy"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "Bill_tripId_fkey"
                        columns: ["tripId"]
                        isOneToOne: false
                        referencedRelation: "Trip"
                        referencedColumns: ["id"]
                    },
                ]
            }
            Trip: {
                Row: {
                    created_at: string
                    created_by: string
                    id: string
                    name: string
                }
                Insert: {
                    created_at?: string
                    created_by: string
                    id?: string
                    name: string
                }
                Update: {
                    created_at?: string
                    created_by?: string
                    id?: string
                    name?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "Trip_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            UserBill: {
                Row: {
                    billId: string
                    id: string
                    tripId: string | null
                    userId: string
                }
                Insert: {
                    billId: string
                    id?: string
                    tripId?: string | null
                    userId: string
                }
                Update: {
                    billId?: string
                    id?: string
                    tripId?: string | null
                    userId?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "UserBill_billId_fkey"
                        columns: ["billId"]
                        isOneToOne: false
                        referencedRelation: "Bill"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "UserBill_tripId_fkey"
                        columns: ["tripId"]
                        isOneToOne: false
                        referencedRelation: "Trip"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "UserBill_userId_fkey"
                        columns: ["userId"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "UserBill_userId_fkey1"
                        columns: ["userId"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            users: {
                Row: {
                    avatar_url: string | null
                    id: string
                    name: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    id: string
                    name?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    id?: string
                    name?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "users_id_fkey"
                        columns: ["id"]
                        isOneToOne: true
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
            }
            UserTrip: {
                Row: {
                    id: string
                    tripId: string
                    userId: string
                }
                Insert: {
                    id?: string
                    tripId: string
                    userId: string
                }
                Update: {
                    id?: string
                    tripId?: string
                    userId?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "UserTrip_tripId_fkey"
                        columns: ["tripId"]
                        isOneToOne: false
                        referencedRelation: "Trip"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "UserTrip_userId_fkey"
                        columns: ["userId"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "UserTrip_userId_fkey1"
                        columns: ["userId"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                ]
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